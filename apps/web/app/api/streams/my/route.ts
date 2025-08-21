import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "../../../lib/auth";


/*
id          String     @id @default(uuid())
  type        StreamType
  active      Boolean
  upvotes     Int
  userId      String
  extractedId String
  title       String    @default("")
  smallThumbnail String @default("")
  largeThumbnail String   @default("")
  url         String
  user        User       @

*/
export async function GET() {
	const session = await getServerSession(authOptions);
	console.log(session?.user.id, "session user id");
	const streams = await prisma.stream.findMany({
		where: {
			userId:session?.user.id ?? ""
		},
		include: {
			user: {
				select: {
					id:true,
					name:true,
				},
			},
		},
		orderBy: {
			upvotes: 'desc'
		}
	})

	return NextResponse.json({
		streams
	})
}