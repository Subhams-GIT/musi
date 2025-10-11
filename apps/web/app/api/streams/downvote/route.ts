import prisma  from "@repo/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import {z} from 'zod'
import authOptions from "../../../../lib/auth";
const DownvoteSchema=z.object({
	streamId:z.string()
})

export async function POST(req:NextRequest){
	const session=await getServerSession(authOptions);

	if(!session?.user?.id){
		return NextResponse.json({
			message:"user not found"
		},{
			status:404
		});
	}

	try {

		const data=DownvoteSchema.parse(await req.json())
		const user=await prisma.upvote.findFirst({
			where:{
				userId:session.user.id,
				streamId:data.streamId
			}
		})

		if(user){
			return NextResponse.json({
				message:"Dont vote twice"
			},{
				status:300
			})
		}
		await prisma.upvote.delete({
			where:{
				userId_streamId:{
					userId:session.user.id,
					streamId:data.streamId	
				}
			}
		})	
		await prisma.stream.update({
			where: {
				id: data.streamId
			},
			data: {
				upvotes: {
					decrement: 1
				}
			}
		})

		return NextResponse.json({
			message:"downvoted!"
		},{
			status:200
		})
	} catch (error) {
		return NextResponse.json({
			message:"cannot vote twice"
		},{
			status:402
		});
	}
}