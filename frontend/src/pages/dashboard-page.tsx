import Loading from "@/components/loading";
import TaskCard from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { API_URLS } from "@/constants";
import { isDeadlineApproaching } from "@/utils/utils";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router";

const DashboardPage = () => {
    const navigateTo = useNavigate();
    const [userRole, setUserRole] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const auth = useAuth();
    const [error, setError] = useState<string>('');
    const [tasks, setTasks] = useState<any[]>([]);


    const [notifications, setNotifications] = useState([]);
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    
     

    useEffect(() => {
        if (auth.isAuthenticated) {
            fetchUserRole();
            fetchTasks();
            if (isAdmin()) {
                // fetchUsers();
            }
        }
    }, [auth.isAuthenticated]);

    const isAdmin = () => {
        return auth.user?.profile["cognito:username"] === "admin";
    } 

    const fetchUserRole = () => {
        const username = auth.user?.profile["cognito:username"];

        if (username === "admin") {
            setUserRole("ADMIN");
            console.log("Logged in as admin");
        } else {
            setUserRole("MEMBER");
            console.log("Logged in as a normal user without admin privileges");
        }
    };




    const sendDeadlineNotification = async (task: { assignee: any; title: any; deadline: string | number | Date }) => {
        try {
            const response = await axios.post(API_URLS.sendNotification, {
                email: task.assignee,
                taskTitle: task.title,
                deadline: task.deadline,
                message: `Task "${task.title}" is due on ${new Date(task.deadline).toLocaleDateString()}. Please complete it soon.`,
            });
            console.log("Notification sent successfully:", response.data);
        } catch (error) {
            console.error("Failed to send notification:", error);
            setError("Failed to send email notification");
        }
    };

    const fetchTasks = async () => {
        try {
            const url = new URL(API_URLS.fetchTask);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();
            const userEmail = auth.user?.profile.email;
            const relevantTasks = isAdmin() ? data : data.filter((task: { assignee: string }) => task.assignee === userEmail);

            const approachingDeadlines = relevantTasks.filter(
                (task: { deadline: string; status: string }) => isDeadlineApproaching(task.deadline) && task.status !== "COMPLETED"
            );

            for (const task of approachingDeadlines) {
                await sendDeadlineNotification(task);
            }

            if (approachingDeadlines.length > 0) {
                setNotificationMessage(`You have ${approachingDeadlines.length} task(s) with approaching deadlines! Check your email for details.`);
                setShowNotification(true);
            }

            setTasks(relevantTasks);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to fetch tasks"); 
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div className="flex items-center m-4">
                <Button onClick={() => navigateTo("/dashboard/create-task")}>Create Task</Button>
            </div>

            {showNotification && (
                <div className="m-4">
                    <p>{notificationMessage}</p>
                </div>
            )}

            {isLoading ? (
                <Loading />
            ) : tasks.length > 0 ? (
                <div className="grid grid-cols-4 m-4 gap-4">
                    {tasks.map((task, index) => (
                        <TaskCard
                            key={index}
                            title={task.title}
                            description={task.description}
                            status={task.status}
                            deadline={task.deadline}
                            assignee={task.assignee}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col h-[70vh] items-center justify-center">
                    <div className="text-3xl font-bold">No tasks available</div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
