import Loading from "@/components/loading";
import TaskCard from "@/components/task-card"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const DashboardPage = () => {
    const navigateTo = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        new Promise(() => {
            setTimeout(() => {
                console.log("Fetching data");
            }, 5000);
            
        }).then().finally(() => setIsLoading(false))
    }, [])

    const tasks = [
        {
            title: "Fix broken icons",
            description: "Resolve the issue with broken icons in Neovim configuration.",
            status: "In Progress",
            deadline: "2025-01-20",
            assignee: "Hamdani Alhassan Gandi"
        },
        {
            title: "Implement crop disease detection model",
            description: "Train and integrate a computer vision model to detect crop diseases and create a chatbot with GPT-4 for recommendations.",
            status: "Pending",
            deadline: "2025-02-10",
            assignee: "Team AI Hackathon"
        },
        {
            title: "Develop geotagging feature",
            description: "Enhance the pothole detection app with an accurate geotagging system.",
            status: "Completed",
            deadline: "2024-08-10",
            assignee: "GOCKAC Team"
        },
        {
            title: "Optimize computer vision model",
            description: "Fine-tune deep learning models for road distress detection and integration.",
            status: "In Progress",
            deadline: "2025-01-30",
            assignee: "Research Team"
        },
        {
            title: "Prepare for BLVCK SAPPHIRE application",
            description: "Update resume and write a compelling cover letter for the Computer Vision Engineer role.",
            status: "Completed",
            deadline: "2025-01-14",
            assignee: "Hamdani Alhassan Gandi"
        },
        {
            title: "Redesign user interface",
            description: "Improve the aesthetics and usability of the pothole detection app.",
            status: "In Progress",
            deadline: "2025-02-05",
            assignee: "UI/UX Team"
        },
        {
            title: "Add 'Group by' functionality",
            description: "Enable 'Group by' option in the Flutter app to organize task information.",
            status: "Pending",
            deadline: "2025-01-25",
            assignee: "Flutter Dev Team"
        },
        {
            title: "Complete geospatial data training",
            description: "Train staff on geospatial data processing using machine learning models.",
            status: "Scheduled",
            deadline: "2025-03-15",
            assignee: "Hamdani Alhassan Gandi"
        },
        {
            title: "Hire junior developers",
            description: "Interview and onboard three front-end and two back-end developers for the team.",
            status: "Pending",
            deadline: "2025-01-28",
            assignee: "Recruitment Team"
        },
        {
            title: "Integrate GPS and address geocoding",
            description: "Add location-based information, including GPS coordinates and address details, to the pothole detection app.",
            status: "In Progress",
            deadline: "2025-02-15",
            assignee: "GOCKAC Team"
        }
    ];

    return (
        <div>
            <div className="flex items-center m-4">
                <Button onClick={() => navigateTo("/dashboard/create-task")}>Create Task</Button>
            </div>
            {
                isLoading ? <Loading />
                    : <div className="grid grid-cols-4 m-4 gap-4">
                        {tasks.map((task) => (
                            <TaskCard
                                title={task.title}
                                description={task.description}
                                status={task.status}
                                deadline={task.deadline}
                                assignee={task.assignee}
                            />
                        ))}
                    </div>}
        </div>
    )
}

export default DashboardPage