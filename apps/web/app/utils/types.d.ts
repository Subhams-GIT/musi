export type Streams={
	  id:string
	  type:"Youtube" | "Spotify"
	  active:boolean
	  upvotes:number
	  userId:string
	  extractedId:string
	  url:string
	  largeThumbnail:string
	  smallThumbnail:string
	  title:string
	  user:{
		id:string
		name:string | null
	  }
}