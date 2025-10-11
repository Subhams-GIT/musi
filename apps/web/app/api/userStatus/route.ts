import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../lib/auth";
import prisma from "@repo/db";

export async function GET(){
	const session=await getServerSession(authOptions);
	if(!session?.user.id){
		return NextResponse.json({
			message:"not logged in "
		},{
			status:500
		})
	}

	try {
		const userStatus=await Promise.all([
		prisma.space.count({
			where:{
				hostId:session.user.id
			}
		}),
		prisma.space.count({
			where:{
				participants:{
					some:{
						id:session.user.id
					}
				}
			}
		}),
		prisma.space.count({
			where:{
				OR:[
					{hostId:session.user.id},
					{participants:{
						some:{
							id:session.user.id}
			}}]
			}
		})
	])

	return NextResponse.json({
		userStatus:{
			totalStreamsDone:userStatus[0],
			totalStreamsAttended:userStatus[1],
			PreviousSpaces:userStatus[2]
		}
	})
	} catch (error) {
		console.error(error);
		return NextResponse.json({
			error:"INTERNAL SERVER ERROR"
		},{
			status:500
		})
	}	
}