import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "react-oidc-context";
import { Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
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
  Box,
  Paper,
  IconButton,
} from "@mui/material";
import { Lock as LockIcon, Edit as EditIcon } from 'lucide-react';

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

  // Separate useEffect for authentication and role setting
  useEffect(() => {
    if (auth.isAuthenticated) {
      const username = auth.user?.profile["cognito:username"];
      const role = username === "admin" ? "ADMIN" : "MEMBER";
      setUserRole(role);
      console.log(`Logged in as ${role}`);
    }
  }, [auth.isAuthenticated, auth.user]);

  // Separate useEffect for fetching tasks after role is set
  useEffect(() => {
    if (auth.isAuthenticated && userRole) {
      console.log("Fetching tasks for role:", userRole);
      fetchTasks();
      if (userRole === 'ADMIN') {
        fetchTeamMembers();
      }
    }
  }, [auth.isAuthenticated, userRole]);


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
      console.log("Fetching tasks...");
      const url = new URL(API_URLS.fetchTask);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched tasks:", data);

      // Filter tasks based on user role and assignee
      const userEmail = auth.user?.profile.email;
      const relevantTasks = userRole === 'ADMIN' ? data : data.filter(task => task.assignee === userEmail);

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
      console.error("Error fetching tasks:", err);
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
      console.log({ members })
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
      fetchTasks(); // Refresh tasks after creating a new one
    } catch (err) {
      setError("Failed to create task");
      console.error("Error creating task:", err);
    }
  };


  const handleUpdateTask = async (taskId, newStatus) => {
    if (!isAdmin()) return;

    try {
      const response = await axios.put(
        API_URLS.updateTask,
        { status: newStatus, id: taskId },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      console.log("Task updated:", response.data);
      fetchTasks(); // Refresh all tasks after update
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
        data: { TaskID: taskId },
        headers: { "Content-Type": "application/json" },
      });
      fetchTasks(); // Refresh tasks after deletion
    } catch (err) {
      console.error("Error deleting task:", err);
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


  const SignInPage = () => (
    <Box
      sx={{
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
            Task Management App
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container 
        maxWidth="sm" 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 3,
          py: 4
        }}
      >
        <Card sx={{ 
          p: 4, 
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          borderRadius: 2
        }}>
          <CardContent>
            <LockIcon size={48} className="mx-auto mb-4" />
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              Welcome
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Please sign in to access your task management dashboard
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => auth.signinRedirect()}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>

        <Card sx={{ 
          p: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: 2
        }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Features
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
              gap: 2,
              mt: 1 
            }}>
              {[
                'Task Creation and Assignment',
                'Deadline Management',
                'Progress Tracking',
                'Team Collaboration'
              ].map((feature, index) => (
                <Paper 
                  elevation={0}
                  key={index}
                  sx={{ 
                    p: 2,
                    backgroundColor: 'rgba(33, 150, 243, 0.05)',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2">{feature}</Typography>
                </Paper>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );

  const [editingTask, setEditingTask] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Add new function to handle task updates by regular users
  const handleUserUpdateTask = async (taskId, updatedData) => {
    try {
      const response = await axios.put(
        API_URLS.updateTask,
        {
          id: taskId,
          ...updatedData
        },
        {
          headers: {
            "Content-Type": "application/json",
          }
        }
      );

      const updatedTask = response.data;

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.TaskID === taskId ? { ...task, ...updatedData } : task
        )
      );

      setEditDialogOpen(false);
      setEditingTask(null);
      console.log("Task successfully updated:", updatedTask);
    } catch (err) {
      console.error("Failed to update task:", err.message);
      setError("Failed to update task");
    }
  };

  const EditTaskDialog = ({ task, open, onClose }) => {
    const [editedTask, setEditedTask] = useState(task);

    const handleSubmit = () => {
      handleUserUpdateTask(task.TaskID, editedTask);
      onClose();
    };

    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            />
            <TextField
              fullWidth
              type="date"
              label="Deadline"
              value={editedTask.deadline}
              onChange={(e) => setEditedTask({ ...editedTask, deadline: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    );
  };


  const TaskCard = ({ task }) => (
    <Card
      sx={{
        mb: 2,
        mr: 2,
        minWidth: 300,
        maxWidth: 345,
        backgroundColor: getCardColor(task.deadline, task.status),
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {task.title}
          </Typography>
          {!isAdmin() && (
            <IconButton
              size="small"
              onClick={() => {
                setEditingTask(task);
                setEditDialogOpen(true);
              }}
              sx={{ ml: 1 }}
            >
              <EditIcon size={20} />
            </IconButton>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {task.description}
        </Typography>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 1,
          p: 1,
          backgroundColor: 'rgba(0,0,0,0.03)',
          borderRadius: 1
        }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Status: {task.status}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            color: isDeadlinePassed(task.deadline) && task.status !== "COMPLETED"
              ? 'error.main'
              : 'text.secondary'
          }}
        >
          Deadline: {new Date(task.deadline).toLocaleDateString()}
          {isDeadlineApproaching(task.deadline) && task.status !== "COMPLETED" &&
            " (Approaching!)"}
          {isDeadlinePassed(task.deadline) && task.status !== "COMPLETED" &&
            " (Overdue!)"}
        </Typography>
        {isAdmin() && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Assignee: {task.assignee}
          </Typography>
        )}
      </CardContent>
      {isAdmin() && (
        <CardActions sx={{ flexWrap: 'wrap', gap: 1, p: 2 }}>
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() => handleUpdateTask(task.TaskID, "COMPLETED")}
          >
            Complete
          </Button>
          <Button
            size="small"
            variant="contained"
            color="warning"
            onClick={() => handleUpdateTask(task.TaskID, "IN_PROGRESS")}
          >
            In Progress
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => handleDeleteTask(task.TaskID)}
          >
            Delete
          </Button>
        </CardActions>
      )}
    </Card>
  );

  const TaskList = () => (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 4 }}>
        {isAdmin() ? "All Tasks" : "My Tasks"}
      </Typography>
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3
      }}>
        {tasks.length === 0 ? (
          <Typography color="text.secondary">No tasks available</Typography>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.TaskID} task={task} />
          ))
        )}
      </Box>
    </Box>
  );

  if (auth.isLoading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (!auth.isAuthenticated) {
    return <SignInPage />;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Task Management App ({userRole})
          </Typography>
          <Button color="inherit" onClick={() => auth.removeUser()}>
            Sign Out
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Welcome, {auth.user?.profile["cognito:username"]}
        </Typography>
        <Grid container spacing={3}>
          {isAdmin() && <AdminTaskCreation />}
          <Grid item xs={12}>
            <TaskList />
          </Grid>
        </Grid>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
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
      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={editDialogOpen}
          onClose={() => {
            setEditDialogOpen(false);
            setEditingTask(null);
          }}
        />
      )}
    </Box>
  );
}

export default App;

