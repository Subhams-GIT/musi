import prisma from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod' // doubt
import youtubesearchapi from 'youtube-search-api';
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

const YT_REGEX = new RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)
const CreateStreamSchema = z.object({
	creatorId: z.string(),
	url: z.url().refine(val => val.includes("youtube") || val.includes("spotify")),
	type: z.enum(["Youtube", "Spotify"]),
	spaceId: z.string()
})

export async function POST(req: NextRequest):Promise<any> {
	const session = await getServerSession(authOptions);
	
	try {
		if (!session?.user.id) {
			return NextResponse.json({
				message: 'You must be signed in to create a stream',
			}, {
				status: 401
			});
		}

		const user = session.user;
		const data = CreateStreamSchema.parse(await req.json());
		const isYT = YT_REGEX.test(data.url)

		if (!isYT) {
			return NextResponse.json({
				message: 'Please provide a valid youtube url ',
			}, {
				status: 400
			});
		}
		const extractedId = data.url.split("?v=")[1] ?? "";
		const videoDetails = await youtubesearchapi.GetVideoDetails(extractedId);
		const thumbnails = JSON.parse(JSON.stringify(videoDetails.thumbnail)).thumbnails;
		if (user.id !== data.creatorId) {
			const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
			const twominutesAgo = new Date(Date.now() - 2 * 60 * 1000);
			const userRecentStreams = await prisma.stream.count({
				where: {
					userId: data.creatorId,
					addedBy: user.id,
					createdAt: {
						gte: tenMinutesAgo,
					}
				}
			})

			const duplicateSong = await prisma.stream.findFirst({
				where: {
					userId: data.creatorId,
					extractedId: extractedId,
					createdAt: {
						gte: tenMinutesAgo,
					},
				},
			});
			if (duplicateSong) {
				return NextResponse.json(
					{
						message: "This song was already added in the last 10 minutes",
					},
					{
						status: 429,
					},
				);
			}
			const streamsLastTwoMinutes = await prisma.stream.count({
				where: {
					userId: data.creatorId,
					addedBy: user.id,
					createdAt: {
						gte: twominutesAgo,
					},
				},
			});

			if (streamsLastTwoMinutes >= 2) {
				return NextResponse.json(
					{
						message:
							"Rate limit exceeded: You can only add 2 songs per 2 minutes",
					},
					{
						status: 429,
					},
				);
			}

			if (userRecentStreams >= 5) {
				return NextResponse.json(
					{
						message:
							"Rate limit exceeded: You can only add 5 songs per 10 minutes",
					},
					{
						status: 429,
					},
				);
			}
		}

		
		thumbnails.sort((a: { url: string, width: number, height: number }, b: { url: string, width: number, height: number }) => a.width < b.width ? -1 : 1);
		const existingActiveStreams = await prisma.stream.count({
			where: {
				spaceId: data.spaceId,
				played: false,
			},
		});

		if(existingActiveStreams>=10){
			return NextResponse.json({
				message:"stream is currently full"
			},
		{
			status:429
		})
		}
		const stream = await prisma.stream.create({
			data: {
				url: data.url,
				extractedId: data.url.split("?v=")[1] ?? "",
				type: data.type,
				upvotes: 0,
				active: false,
				title: videoDetails.title ?? "",
				smallThumbnail: thumbnails[0].url ?? "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
				largeThumbnail: thumbnails[1].url ?? "https://cdn.pixabay.com/photo/2024/02/28/07/42/european-shorthair-8601492_640.jpg",
				user: {
					connect: {
						id: session?.user.id ?? ""
					}
				},
				addedByUser:{
					connect:{
						id:user.id
					}
				},
				space:{
					connect:{
						id:data.spaceId
					}
				}
			}
		})

		return NextResponse.json({
			...stream,
			hasupvoted:false,
			upvotes:0,
		})

	} catch (error) {
		console.log(error)
		return NextResponse.json({
			error: error,
			message: 'Error  while creating a stream',
		}, {
			status: 500
		});
	}
}

export async function GET(req: NextRequest):Promise<any> {
  const spaceId = req.nextUrl.searchParams.get("spaceId");
  if (!spaceId) {
	return NextResponse.json({
		message: "Error"
	}, {
		status: 411
	})
}
  const session = await getServerSession(authOptions);
  if (!session?.user.id) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 403,
      },
    );
  }
  const user = session.user;


  const [space, activeStream] = await Promise.all([
    prisma.space.findUnique({
      where:{
		id:spaceId,
		
	  },
	  include:{
		streams:{
			where:{
				played:false,
				userId:session.user.id
			},
			select:{
				upvotes:true,
			}
		},
		_count:{
			select:{
				streams:true
			}
		}
	},
	
}),
  await prisma.currentStream.findFirst({
      where: {
          spaceId: spaceId
      },
      include: {
          stream: true
      }
  })
  ]);

  const hostId =space?.hostId;
  const isCreator = session.user.id=== hostId

  return NextResponse.json({
    streams: space?.streams.map(({ ...rest}) => ({
        ...rest,
        upvotes: rest.upvotes,
        haveUpvoted: rest.upvotes.toString().length ? true : false
    })),
    activeStream,
    hostId,
    isCreator,
    spaceName:space?.name
});
}