import { getServerSession } from "next-auth";
import MusicPlatformLanding from "../components/LandingPage";
import authOptions from "./lib/auth";
import { redirect } from "next/navigation";
export default async function Home() {
  const session=await getServerSession(authOptions);
  if(session?.user){
    redirect('/dashboard')
  }
  return (
    <div>
      <MusicPlatformLanding />
    </div>
  );
}
