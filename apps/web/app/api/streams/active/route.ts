import { getServerSession } from "next-auth";
import authOptions from "../../../lib/auth";
import { prisma } from "@repo/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
	const session = await getServerSession(authOptions);
	const data = await req.json();

	if (!session?.user.id && !data.streamerId) {
		return NextResponse.json({
			error: "Unauthorized"
		});
	}

	try {
		await prisma.stream.update({
			where: {
				id: data.streamId ,
			},
			data: {
				active: data.choice,
			},
		});
		return NextResponse.json({
			success: true
		}, {
			status: 200
		});
	} catch (error) {
		console.log(error)
		return NextResponse.json({
			error: "Failed to activate stream"
		},
			{
				status: 500
			}
		);
	}
}

export async function GET(req: NextRequest) {
	console.log(req.url);
	const session = await getServerSession(authOptions);
	if (!session?.user.id) {
		return NextResponse.json({
			error: "Unauthorized"
		}, {
			status: 401
		});
	}

	try {
		const streams = await prisma.stream.findMany({
			where: {
				active: true,
				userId: session.user.id
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
				upvotes: 'desc'
			}
		});

		return NextResponse.json({
			streams
		});
	} catch (error) {
		return NextResponse.json({
			error: "Failed to fetch active streams"
		}, {
			status: 500
		});
	}
}