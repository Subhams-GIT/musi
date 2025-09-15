import { createShareLink } from "@repo/redis/src";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
	const data = req.nextUrl.searchParams.get("id");
	console.log("search id", data)
	if (!data) {
		throw new Error("no id found")
	}
		let streamerid = await createShareLink("", data)
		console.log("active", streamerid)
		streamerid=streamerid?.replace(/^"|"$/g, "");
		try {
			const res = await fetch(`http://localhost:3000/api/streams/active?id=${streamerid}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			})
			const data = await res.json();
			console.log("streamer data",data)
			if (!data.streams) {
				return NextResponse.json({
					"streamerID":streamerid,
					"streams":[]
				})
			}
			return NextResponse.json({
				"streamerID":streamerid,
				"streams":data.streams
			});
		}
	 catch (error) {
		console.error;
		return NextResponse.json({
			msg: "error fetching !"
		})

	}
}