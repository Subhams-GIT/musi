import { NextRequest, NextResponse } from "next/server";
import { createShareLink } from "@repo/redis/src/index";
// import { streamManager } from "../../../../auxillary-service/src/streammanager";
import { getServerSession } from "next-auth";
import authOptions from "../../lib/auth";

export  async function POST(req: NextRequest) {
	const session=await getServerSession(authOptions);
	const re = await req.json();
	const id=re.id;
	try {
		const res = await createShareLink(id,"");
		return NextResponse.json({
			message:res
		})
	} catch (error) {
		console.error(error)
	}
}

export async function GET(req:NextRequest){
	const hash=req.nextUrl.searchParams.get('h');
	try {
		if(!hash){
			return ;
		}
		const res=await createShareLink("",hash);
		return NextResponse.json({
			res:res
		})
	} catch (error) {
		console.error(error);
		return NextResponse.json({
			message:"error"
		})
	}
}