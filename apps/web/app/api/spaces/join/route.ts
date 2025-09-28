import { getServerSession } from "next-auth";
import prisma from "@repo/db";
import authOptions from "../../../lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const streamId = params.id;
    try {
        const stream = await prisma.space.findUnique({ where: { id: streamId } });
        if (!stream) {
            return new Response(JSON.stringify({ message: "Stream not found" }), { status: 404 });
        }

      await prisma.space.update({
        where:{
            id:streamId
        },
        data:{
            participants:{
                connect:{
                    id:session.user.id
                }
            }
        }
      })

        const joinee=await prisma.user.findFirst({
            where:{
                id:session.user.id
            }
        })
        return NextResponse.json({
            message: "joined stream sucessfully",
            joinee
        }, {
            status: 200
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({
            error: "error while joining space!"
        })
    }
}
