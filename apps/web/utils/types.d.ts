export type Streams = {
	id: string
	type: "Youtube" | "Spotify"
	active: boolean
	upvotes: number
	userId: string
	extractedId: string
	url: string
	largeThumbnail: string
	smallThumbnail: string
	title: string
	user: {
		id: string
		name: string | null
	}
}

export type Spaces = {
	id: String,
	name: String
	streams: Stream[]
	hostId: String
	hostName: String
	isActive: Boolean
	currentStream?:String
	joinees?:number
	myvotes?:number
	mysongs?:number
	hosted?:boolean
}

export type UserStatus = {
	"total Streams Done": number,
	"total Participants": number,
	"total Streams Attended": number;
}

export type History = {
	spaces: Spaces[]
}

export type Hosted={
	spaces:Spaces[]
}