export async function getsctive() {
	try {
		const res=await fetch("http://localhost:3000/api/streams/active",{
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