import { NextRequest, NextResponse } from "next/server";
import { createShareLink } from "@repo/redis/src/index";


export  async function POST(req: NextRequest) {
	const re = await req.json();
	const id=re.id;
	console.log(id);
	try {
		const res = await createShareLink(id,"");
		console.log("res",res);
		return NextResponse.json({
			message:res
		})
	} catch (error) {
		console.error(error)
	}
}

export async function GET(req:NextRequest){
	const hash=req.nextUrl.searchParams.get('h');
	console.log('hash',hash)
	try {
		if(!hash){
			return ;
		}
		const res=await createShareLink("",hash);
		console.log(res);
		
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