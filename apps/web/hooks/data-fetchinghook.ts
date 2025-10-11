

// get

export async function useDataFetching(url:string,depe:any[]){
    try {
        const res=await fetch(url,{
            method:'GET',
        })
        const data=await res.json();
        return data;
    } catch (error) {
        return new Error('cannot fetch data');
    }
}