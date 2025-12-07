import { LogOutIcon, MenuIcon, Music, Plus } from "lucide-react";
import { signOut } from "next-auth/react";


type navbarprops={
    open:boolean,
    setopen:(open:boolean)=>void
    title:string
}

export default function NavBar(open:navbarprops){
    return (
       <nav className="flex justify-between border-0 items-center shadow-xl pb-4 static">
                <button className="cursor-pointer" onClick={()=>open.setopen(!open.open)}><MenuIcon /></button>
               
                <button className=" w-fit text-sm md:text-md flex items-center cursor-pointer  bg-white rounded-md px-1 py-1 md:px-4  text-black"><LogOutIcon className="h-4 w-4 mr-2" 
                onClick={()=>
                  signOut({ redirect: false }).then(() => {
                    window.location.reload();
                  })}/>SignOut</button>
        </nav>
    )
}