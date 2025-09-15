import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "../../../lib/auth";
import prisma  from "@repo/db";
import z from 'zod'

const voteSchema = z.object({
	streamerid: z.string(),
	streamId: z.string(),
	vote: z.enum(["up", "down"])
})
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const data = await req.json();
	try {
		if (!session) {
			return NextResponse.json({
				"message": "sign in"
			}, {
				status: 404
			})
		}
		const streamdata =  voteSchema.parse(data)
		const response = await prisma.upvote.findFirst({
			where: {
				userId: session.user.id,
				streamId: streamdata.streamId
			}
		})
		if (response) {
			return NextResponse.json({
				"message": "Dont vote twice!"
			}, {
				status: 403
			})
		}

		if (streamdata.vote === 'up') {
			await prisma.stream.update({
				where: {
					id: streamdata.streamId
				},
				data: {
					upvotes: {
						increment: 1
					}
				}
			})
		}
		else {
			await prisma.stream.update({
				where: {
					id: streamdata.streamId
				},
				data: {
					upvotes: {
						decrement: 1
					}
				}
			})
		}

		return NextResponse.json({
			message:"voted"
		},{
			status:200
		})
		
	} catch (error) {
		console.error(error);
		return NextResponse.json({
			message:"voted"
		},{
			status:200
		})
	}
}