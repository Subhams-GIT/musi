import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }


  // console.log("Verified token payload:", token);
  // { name, email, uid, sessionId, iat, exp, jti }

  return NextResponse.next();
}
export const config = {
  matcher: ["/dashboard"], // ✅ only protect these
};