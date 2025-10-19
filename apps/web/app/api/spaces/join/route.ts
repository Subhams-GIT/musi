
import authOptions from '@/lib/auth';
import prisma from '@repo/db';
import { getSpace } from '@repo/redis';
import jwt from 'jsonwebtoken'
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req:NextRequest){
    const session=await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('t');
    if(token==null){
        return NextResponse.json({
            message:"token not found"
        },{
            status:404
        })
    }
    try {
        const decoded=JSON.parse(JSON.stringify(jwt.verify(token,process.env.NEXT_PUBLIC_CLIENT_SECRET as string)));
        const isValid=getSpace(token);
        if(!isValid){
            return NextResponse.json({
                success:false,
                message:"not a valid token"
            })
        }
        const space=await prisma.space.findFirst({
            where:{
                id:decoded.spaceId
            },
            include:{
                participants:true,
                currentStream:true,
                streams:true,
            }
        })
        if(!space){
            return NextResponse.json({
                success:false,
                message:"space not found!"
            })
        }
        await prisma.space.update({
            where:{
                id:decoded.spaceId
            },
            data:{
                participants:{
                    connect:{
                        id:session?.user.id
                    }
                }                
            }
        })
     
        await prisma.user.update({
            where:{
                id:session?.user.id
            },
            data:{
                joinedSpaces:{
                    connect:{
                        id:decoded.spaceId
                    }
                }
            }
        })
        return NextResponse.json({
            message:"joined space",
            space
        },{
            status:200
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json({
            message:"couldnot join space"
        })
    }

}