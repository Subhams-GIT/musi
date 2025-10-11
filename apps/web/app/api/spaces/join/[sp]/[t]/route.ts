import { getServerSession } from "next-auth";
import prisma from "@repo/db";
import authOptions from "lib/auth";
import { NextResponse } from "next/server";
import { useContext } from "react";
import { WebSocketContext } from "Context/wsContext";
import { getSpace } from "@repo/redis";


export async function POST(req: Request, { params }: { params: { id: string , token:string} }) {
    const ws = useContext(WebSocketContext)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
    }

    const streamId = params.id;
    const token=params.token;
    try {
        const stream = await prisma.space.findUnique({ where: { id: streamId } });
        const isValidToken=await getSpace(token);
        
        if (!stream || !isValidToken) {
            return new Response(JSON.stringify({ message: "space not found" }), { status: 404 });
        }
        const existing = await prisma.space.findFirst({
            where: {
                id: streamId,
            },
            include: {
                participants: {
                    where: {
                        id: session.user.id
                    }
                }
            }
        })

        if (existing && existing?.participants.length > 0) {
            return NextResponse.json({
                msg: "you are already in the Space !"
            }, {
                status: 400
            })
        }

        await prisma.space.update({
            where: {
                id: streamId
            },
            data: {
                participants: {
                    connect: {
                        id: session.user.id
                    }
                }
            }
        })
        const joinee = await prisma.user.findFirst({
            where: {
                id: session.user.id
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
