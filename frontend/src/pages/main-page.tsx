import { Button } from "@/components/ui/button"
import { Link, Outlet } from "react-router-dom"

const MainPage = () => {
    return (
        <div>
            <div className="flex p-4 justify-between bg-gray-900">
                <Link to="/dashboard" className="text-xl font-black text-white">Task Management App</Link>
                <Button variant="destructive">Sign out</Button>
            </div>
            <div>
                <Outlet />
            </div>
        </div>
    )
}

export default MainPage