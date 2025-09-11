import getstreamerid from "@repo/redis/src";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "../../lib/auth";


export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const session = await getServerSession(authOptions);

  if (!id && !session?.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const streamerId = id ?? session!.user.id;

  try {
    let active = await getstreamerid(streamerId)
    if(typeof active !== 'string'){
      throw new Error("user not found check the link and try again !")
    }
    active = active.replace(/^"|"$/g, "")
    return NextResponse.json({
      active
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Redis read failed" }, { status: 500 });
  }
}
