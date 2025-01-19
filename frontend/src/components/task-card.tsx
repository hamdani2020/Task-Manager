import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "./ui/button"
import { isDeadlineApproaching, isDeadlinePassed } from "@/utils/utils"

const TaskCard = ({...props}) => {
    const {title, description, status, deadline, assignee} = props

    return (
        <Card className={`${isDeadlinePassed(deadline) && "bg-red-400/20"} ${isDeadlineApproaching(deadline) && "bg-yellow-500/20 "}`}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Status: {status}</p>
                <p>Deadline: {deadline}</p>
                <p className="mt-2">User: {assignee}</p>
            </CardContent>
            <CardFooter>
                <div className="flex space-x-4">
                    <Button className="text-wrap py-6" variant="green">MARK AS COMPLETED</Button>
                    <Button className="text-wrap py-6" variant="yellow">MARK AS IN PROGRESS</Button>
                    <Button className="text-wrap py-6" variant="destructive">DELETE TASK</Button>
                </div>
            </CardFooter>
        </Card>

    )
}

export default TaskCard
