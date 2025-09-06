export function checkforurl(url:string){
	const YT_REGEX = new RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)
	if(url.includes("youtube")){
		if(YT_REGEX.test(url)){
			return true;
		}
	}
}