import prisma from "@repo/db";
import { getServerSession } from "next-auth";
import {  NextResponse } from "next/server";
import authOptions from "../../../lib/auth";
// import { StreamState } from "http2";

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
	  user:{
		id:string
		name:string | null
	  }
}

export async function GET():Promise<any[] | any> {
	const session = await getServerSession(authOptions);
	console.log(session?.user.id, "session user id");
	if(!session?.user?.id){
		return NextResponse.json({
			message:"user not found"
		},{
			status:404
		});
	}
	try {
		const spaces = await prisma.space.findMany({
		where: {
			hostId: session.user.id
		},
		select: {
			id: true
		}
	});

	
	return NextResponse.json({
		spaces
	})	
} catch (error) {
	console.error(error);
	return NextResponse.json({
		message: "Failed to fetch streams"
	}, {
		status: 500
	});
}

}