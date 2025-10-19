import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // console.log("Verified token payload:", token);
  // { name, email, uid, sessionId, iat, exp, jti }

  return NextResponse.next();
}
