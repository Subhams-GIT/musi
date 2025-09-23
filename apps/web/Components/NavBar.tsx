import { MenuIcon, Music, Plus } from "lucide-react";

export default function NavBar(){
    return (
       <nav className="flex justify-between items-center border-b border-gray-700 pb-4 static">
                <section className="cursor-pointer "><MenuIcon /></section>
                <section className="flex gap-x-1 "><Music /> StreamSync</section>
                <button className=" w-fit text-sm md:text-md flex items-center cursor-pointer  bg-white rounded-md px-1 py-1 md:px-4  text-black"><Plus className="h-4 w-4 mr-2" />Create </button>
        </nav>
    )
}