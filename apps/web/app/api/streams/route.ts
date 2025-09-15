import prisma from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from 'zod' // doubt
import youtubesearchapi from 'youtube-search-api';
import { getServerSession } from "next-auth";
import authOptions from "../../lib/auth";
type userStreams={
	id:string
	type:"Youtube" | "Spotify"
	active:boolean
	upvotes:number
	userId:string
	extractedId:string
	url:string
	largeThumbnail:string
	smallThumbnail:string
	title:string

}
const YT_REGEX = new RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)
const CreateStreamSchema = z.object({
	creatorId: z.string(),
	url: z.url().refine(val => val.includes("youtube") || val.includes("spotify")),
	type: z.enum(["Youtube", "Spotify"])
})

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);
	// console.log(session, "session user id");
	try {
		if (!session?.user) {
			return NextResponse.json({
				message: 'You must be signed in to create a stream',
			}, {
				status: 401
			});
		}
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
		// console.log(thumbnails.thumbnails);
		thumbnails.sort((a: { url: string, width: number, height: number }, b: { url: string, width: number, height: number }) => a.width < b.width ? -1 : 1);
		const res=await prisma.stream.create({
			data: {
				url: data.url,
				extractedId: data.url.split("?v=")[1] ?? "",
				type: data.type,
				upvotes: 0,
				active: false,
				title: videoDetails.title ?? "",
				smallThumbnail: thumbnails[0].url ?? "",
				largeThumbnail: thumbnails[1].url ?? "",
				user:{
					connect: {
						id: session?.user.id ?? ""
					}
				}
			}
		})

		return NextResponse.json({
			message: 'Stream created successfully',
			streamId:res.id
		}, {
			status: 201
		});

	} catch (error) {
		console.log(error)
		return NextResponse.json({
			error:error,
			message: 'Error  while creating a stream',
		}, {
			status: 400
		});
	}
}

export async function GET(req: NextRequest):Promise<NextResponse<{streams:userStreams[]}|{message:string}>> {
	const creatorId = req.nextUrl.searchParams.get("creatorId");
	const streams = await prisma.stream.findMany({
		where: {
			userId: creatorId ?? ""
		}
	})

	return NextResponse.json({
		streams
	})
}

