const handleVote = async (trackId: string, voteType: "up" | "down") => {
  try {
    const res = await fetch(
      `http://localhost:3000/api/streams/${voteType === "up" ? "upvote" : "downvote"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ streamId: trackId }),
      }
    );
    // const data = await res.json();
    if (res.status == 200) return true;
    // console.log("Vote updated:", data); 
    else throw new Error("Dont vote twice")

  } catch (error) {
    console.error("Error updating vote:", error);
    throw new Error("ERROR voting!")
  }
};


export async function removefromActive(trackId:string,active:boolean){
  try {
    const res = await fetch(
      `http://localhost:3000/api/streams/active`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ streamId: trackId,active }),
      }
    );
    console.log(res)
    // const data = await res.json();
    if (res.status == 200) return true;
    // console.log("Vote updated:", data); 
    else throw new Error("not able to deactivate")

  } catch (error) {
    console.error("Error updating ", error);
    throw new Error("ERROR updating!")
  }
}
export default handleVote;