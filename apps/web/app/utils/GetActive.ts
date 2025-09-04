

export async function getsctive(id:string) {
	console.log('streamer id',id)
	try {
		const res=await fetch(`http://localhost:3000/api/streams/active?id=${id}`,{
		method:'GET',
		headers:{
			'Content-Type': 'application/json'
		},
		
	})

	const data=await res.json();
	if(!data.streams){
		return [];
	}
	return data.streams;
	} catch (error) {
		console.error("Error fetching active streams:", error);
		return [];
	}
}
