import { getServerSession } from "next-auth";
import authOptions from "../../../lib/auth";
import prisma  from "@repo/db";
import { NextRequest, NextResponse } from "next/server";
type Streams={
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
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const data = await req.json();

  if (!session?.user.id && !data.streamerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.stream.update({
      where: {
        id: data.streamId,
        userId: session?.user.id ?? data.streamerId,
      },
      data: {
        active: data.choice,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to activate stream" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) :Promise<NextResponse<{streams:Streams[]}|{error:String}>>{
  const data = req.nextUrl.searchParams.get("id");
  const session = await getServerSession(authOptions);

  if (!data && !session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId = data ?? session!.user.id;
  userId = userId.replace(/^"|"$/g, "");
  console.log("user id ", userId);
  try {
    const streams = await prisma.stream.findMany({
      where: {
        active: true,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        upvotes: "desc",
      },
    });

    return NextResponse.json({ streams }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch active streams" },
      { status: 500 },
    );
  }
}
