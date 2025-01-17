import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import './index.css'
import TaskForm from './components/TaskForm.js'
import { useAuth } from "react-oidc-context";
import { Alert, Snackbar } from "@mui/material";
import LandingPage from './components/LandingPage.js'// Add these imports
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

function App() {
  const auth = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    deadline: "",
    status: "PENDING"
  });
  const [error, setError] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  const API_URLS = {
    fetchTask: "https://71aos5nio2.execute-api.eu-west-1.amazonaws.com/getTask",
    createTask: "https://plaaw9qjn7.execute-api.eu-west-1.amazonaws.com/createTask",
    updateTask: "https://rlyzlu0dl0.execute-api.eu-west-1.amazonaws.com/updateTask",
    deleteTask: "https://1b4916boze.execute-api.eu-west-1.amazonaws.com/delete",
    fetchUsers: "https://your-api-url/getUsers",
    sendNotification: "https://yjja5gnwql.execute-api.eu-west-1.amazonaws.com/sendNotification"
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchUserRole();
      fetchTasks();
      if (isAdmin()) {
        fetchUsers();
      }
    }
  }, [auth.isAuthenticated]);

  const fetchUserRole = () => {
  // In a real application, the username and roles would typically come from your authentication system.
  const username = auth.user?.profile["cognito:username"];
  
  if (username === "admin") {
    // Assign 'ADMIN' role if username matches 'admin'
    setUserRole("ADMIN");
    console.log("Logged in as admin");
  } else {
    // Default to 'MEMBER' role otherwise
    setUserRole("MEMBER");
    console.log("Logged in as a normal user without admin privileges");
  }
};



  const titleRef = useRef();
  const descriptionRef = useRef();
  const assigneeRef = useRef();
  const deadlineRef = useRef();

const isAdmin = () => userRole === 'ADMIN';

const fetchUsers = async () => {
  try {
    const response = await axios.get(API_URLS.fetchUsers, {
      headers: { Authorization: `Bearer ${auth.user?.access_token}` },
    });
    setUsers(response.data);
  } catch (err) {
    setError("Failed to fetch users");
  }
};



    // Add new state for notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // Function to check if a deadline is approaching (within 3 days)
  const isDeadlineApproaching = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  // Function to check if a deadline has passed
  const isDeadlinePassed = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  // Function to get card background color based on deadline
  const getCardColor = (deadline, status) => {
    if (status === "COMPLETED") return "#e8f5e9"; // Light green for completed tasks
    if (isDeadlinePassed(deadline)) return "#ffebee"; // Red for passed deadline
    if (isDeadlineApproaching(deadline)) return "#fff3e0"; // Orange for approaching deadline
    return "white"; // Default color
  };


   // Function to send email notification via SNS
  const sendDeadlineNotification = async (task) => {
    try {
      const response = await axios.post(API_URLS.sendNotification, {
        email: task.assignee,
        taskTitle: task.title,
        deadline: task.deadline,
        message: `Task "${task.title}" is due on ${new Date(task.deadline).toLocaleDateString()}. Please complete it soon.`
      });
      console.log("Notification sent successfully:", response.data);
    } catch (error) {
      console.error("Failed to send notification:", error);
      setError("Failed to send email notification");
    }
  };

   const fetchTasks = async () => {
    try {
      const token = auth.user?.access_token;
      const url = new URL(API_URLS.fetchTask);
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Filter tasks based on user role and assignee
      const userEmail = auth.user?.profile.email;
      const relevantTasks = isAdmin() ? data : data.filter(task => task.assignee === userEmail);
      
      // Check for approaching deadlines and send notifications
      const approachingDeadlines = relevantTasks.filter(
        task => isDeadlineApproaching(task.deadline) && task.status !== "COMPLETED"
      );

      // Send email notifications for approaching deadlines
      for (const task of approachingDeadlines) {
        await sendDeadlineNotification(task);
      }

      // Set UI notifications
      if (approachingDeadlines.length > 0) {
        setNotificationMessage(`You have ${approachingDeadlines.length} task(s) with approaching deadlines! Check your email for details.`);
        setShowNotification(true);
      }

      setTasks(relevantTasks);
    } catch (err) {
      console.log(err);
      setError(err.message || "Failed to fetch tasks");
    }
  };

const fetchTeamMembers = async () => {
        try {
            const response = await fetch('https://vwjwg4yut4.execute-api.eu-west-1.amazonaws.com/user');
            if (!response.ok) {
                throw new Error('Failed to fetch team members');
            }
            const data = await response.json();
            console.log(data)
            console.log(data.users)
            const members = data.users.filter((user) => user);
            console.log({members})
            setTeamMembers(members);
        } catch (error) {
            setError(error.message);
        }
    };

   const handleCreateTask = async () => {
    if (!isAdmin()) return;

    const newTask = {
      title: titleRef.current.value,
      description: descriptionRef.current.value,
      assignee: assigneeRef.current.value,
      deadline: deadlineRef.current.value,
      status: "PENDING",
    };

    try {
      const response = await axios.post(API_URLS.createTask, newTask, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setError("");
      console.log("Task created:", response.data);
      // Refresh tasks after creating a new one
      fetchTasks();
    } catch (err) {
      setError("Failed to create task");
    }
  };
  const handleUpdateTask = async (taskId, newStatus) => {
  if (!isAdmin()) return;

  try {
    const response = await axios.put(
      API_URLS.updateTask, // Use TaskID query parameter
      { status: newStatus,id:taskId }, // Payload matches Lambda's expected structure
      {
        headers: { 
          "Content-Type": "application/json",
          //Authorization: `Bearer ${auth.user?.access_token}`
        }
      }
    );

    const updatedTask = response.data;
      console.log(updatedTask)

    // Update task state with the new values
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.TaskID === taskId ? { ...task, ...updatedTask } : task
      )
    );

    console.log("Task successfully updated:", updatedTask);
  } catch (err) {
    console.error("Failed to update task:", err.message);
    setError("Failed to update task");
  }
};


  const notifyTask = async (data) => {
  const response = await fetch("https://efd8swtncb.execute-api.eu-west-1.amazonaws.com/notify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const result = await response.json();
  console.log(result);
};

  const handleDeleteTask = async (taskId) => {
  if (!isAdmin()) return;
  try {
    await axios.delete(API_URLS.deleteTask, {
        data:{TaskID:taskId},
        headers: { "Content-Type": "application/json" },
    });
    setTasks((prevTasks) => prevTasks.filter((task) => task.TaskID !== taskId));
  } catch (err) {
    console.error(err);  // Log the error for debugging
    setError("Failed to delete task");
  }
};

    useEffect(() => {
        fetchTeamMembers();
    }, []);

  const AdminTaskCreation = () => (
    
  <Grid item xs={12} md={6}>
      <Typography variant="h5">Create Task</Typography>

      {/* Title Input */}
      <TextField
        fullWidth
        label="Title"
        inputRef={titleRef}
        margin="normal"
      />

      {/* Description Input */}
      <TextField
        fullWidth
        label="Description"
        inputRef={descriptionRef}
        margin="normal"
      />

      {/* Assignee Select */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Assignee</InputLabel>
        <Select
          inputRef={assigneeRef}
          defaultValue=""
        >
          {teamMembers.map((user) => (
            <MenuItem key={user.email} value={user.email}>
              {user.email}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Deadline Input */}
      <TextField
        fullWidth
        type="date"
        label="Deadline"
        inputRef={deadlineRef}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />

      {/* Create Task Button */}
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateTask}
        sx={{ mt: 2 }}
      >
        Create Task
      </Button>

      {/* Error Message */}
      {error && <Typography color="error">{error}</Typography>}
    </Grid>
);


  const TaskList = () => (
    <div style={{ margin: '20px'}}>
      <Typography variant="h5" gutterBottom>
        {isAdmin() ? "All Tasks" : "My Tasks"}
      </Typography>

    <div
      item
      xs={12}
      md={isAdmin() ? 6 : 12}
      sx={!isAdmin() ? { marginTop: 4 }: {}}
      
      wrap="wrap"
    >
      <div className="" style={{ display: 'flex'}}>
      {tasks.length === 0 ? (
        <Typography>No tasks available</Typography>
      ) : (
        tasks.map((task) => (
          <Card
            key={task.TaskID}
            sx={{ 
              mb: 2, 
              mr: isAdmin() ? 9 : 2, 
              minWidth: 275,
              backgroundColor: getCardColor(task.deadline, task.status)
            }}
          >
            <CardContent>
              <Typography variant="h6">{task.title}</Typography>
              <Typography>{task.description}</Typography>
              <Typography>Status: {task.status}</Typography>
              <Typography 
                sx={{ 
                  color: isDeadlinePassed(task.deadline) && task.status !== "COMPLETED" ? 'error.main' : 'inherit'
                }}
              >
                Deadline: {new Date(task.deadline).toLocaleDateString()}
                {isDeadlineApproaching(task.deadline) && task.status !== "COMPLETED" && 
                  " (Approaching!)"}
                {isDeadlinePassed(task.deadline) && task.status !== "COMPLETED" && 
                  " (Overdue!)"}
              </Typography>
              {isAdmin() && <Typography>Assignee: {task.assignee}</Typography>}
            </CardContent>
            {isAdmin() && (
              <CardActions>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleUpdateTask(task.TaskID, "COMPLETED")}
                >
                  Mark as Completed
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={() => handleUpdateTask(task.TaskID, "IN_PROGRESS")}
                >
                  Mark as In Progress
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteTask(task.TaskID)}
                >
                  Delete Task
                </Button>
              </CardActions>
            )}
          </Card>
        ))
      )}
      </div>
     
      
    </div>
    </div>
    
  );


  if (auth.isLoading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  
  if (auth.isAuthenticated) {
    return (
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Task Management App ({userRole})
            </Typography>
            <Button color="inherit" onClick={() => auth.removeUser()}>
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>
        <Container sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome, {auth.user?.profile["cognito:username"]}
          </Typography>
          <Grid container spacing={2}>
            {isAdmin() && <AdminTaskCreation />}
            <TaskList />
          </Grid>
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Snackbar
            open={showNotification}
            autoHideDuration={6000}
            onClose={() => setShowNotification(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={() => setShowNotification(false)} 
              severity="warning" 
              sx={{ width: '100%' }}
            >
              {notificationMessage}
            </Alert>
          </Snackbar>
        </Container>
      </div>
    );
  }
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Task Management App
          </Typography>
          <Button color="inherit" onClick={() => auth.signinRedirect()}>
            Sign In
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Typography variant="h5">Please sign in to manage tasks</Typography>
      </Container>
    </div>
  );
}

export default App;
