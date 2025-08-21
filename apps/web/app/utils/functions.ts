
export const parseTrackFromUrl = (url: string): boolean | null => {
  if (url.includes("youtube.com") || url.includes("spotify.com")) {
    return true;
  }
  return null;
};

export const handleVote = async (trackId: string, voteType: "up" | "down") => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/streams/${voteType === "up" ? "upvote" : "downvote"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({streamId: trackId}),
        }
      );
      const data = await res.json();
      console.log("Vote updated:", data);
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };
