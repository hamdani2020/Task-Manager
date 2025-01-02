import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "react-oidc-context";
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

  const API_URLS = {
    fetchTask: "https://71aos5nio2.execute-api.eu-west-1.amazonaws.com/getTask",
    createTask: "https://plaaw9qjn7.execute-api.eu-west-1.amazonaws.com/createTask",
    updateTask: "https://ee4bon70sb.execute-api.eu-west-1.amazonaws.com/updateTask",
    deleteTask: "https://your-api-url/deleteTask",
    fetchUsers: "https://your-api-url/getUsers"
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
    // In a real application, this would come from your authentication system
    // For now, we'll check if the user's email contains 'admin'
    const role = auth.user?.profile.email.includes('admin') ? 'ADMIN' : 'MEMBER';
    setUserRole(role);
  };

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

  const fetchTasks = async () => {
  try {
    const token = auth.user?.access_token;
    const url = new URL(API_URLS.fetchTask);

    // Append query parameter for assignee if the user is not an admin
    

    const response = await fetch(url);
    console.log(await response.json())

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    setTasks(data);
  } catch (err) {
    setError(err.message || "Failed to fetch tasks");
  }
};


  const handleCreateTask = async () => {
    if (!isAdmin()) return;
    
    try {
      const response = await axios.post(
        API_URLS.createTask,
        newTask,
        {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.user?.access_token}`
          }
        }
      );
      setTasks((prevTasks) => [...prevTasks, response.data]);
      setNewTask({ title: "", description: "", assignee: "", deadline: "", status: "PENDING" });
    } catch (err) {
      setError("Failed to create task");
    }
  };

  const handleUpdateTask = async (taskId, status) => {
    if (!isAdmin()) return;
    
    try {
      const response = await axios.patch(
        `${API_URLS.updateTask}/${taskId}`,
        { status },
        {
          headers: { Authorization: `Bearer ${auth.user?.access_token}` },
        }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.task_id === taskId ? { ...task, status: response.data.status } : task
        )
      );
    } catch (err) {
      setError("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!isAdmin()) return;

    try {
      await axios.delete(`${API_URLS.deleteTask}/${taskId}`, {
        headers: { Authorization: `Bearer ${auth.user?.access_token}` },
      });
      setTasks((prevTasks) => prevTasks.filter((task) => task.task_id !== taskId));
    } catch (err) {
      setError("Failed to delete task");
    }
  };

  const AdminTaskCreation = () => (
    <Grid item xs={12} md={6}>
      <Typography variant="h5">Create Task</Typography>
      <TextField
        fullWidth
        label="Title"
        value={newTask.title}
        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Description"
        value={newTask.description}
        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Assignee</InputLabel>
        <Select
          value={newTask.assignee}
          onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
        >
          {users.map((user) => (
            <MenuItem key={user.email} value={user.email}>
              {user.email}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        type="date"
        label="Deadline"
        value={newTask.deadline}
        onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
        margin="normal"
        InputLabelProps={{ shrink: true }}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleCreateTask}
        sx={{ mt: 2 }}
      >
        Create Task
      </Button>
    </Grid>
  );

  const TaskList = () => (
    <Grid item xs={12} md={isAdmin() ? 6 : 12}>
      <Typography variant="h5">
        {isAdmin() ? "All Tasks" : "My Tasks"}
      </Typography>
      {tasks.length === 0 ? (
        <Typography>No tasks available</Typography>
      ) : (
        tasks.map((task) => (
          <Card key={task.task_id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{task.title}</Typography>
              <Typography>{task.description}</Typography>
              <Typography>Status: {task.status}</Typography>
              <Typography>Deadline: {task.deadline}</Typography>
              {isAdmin() && <Typography>Assignee: {task.assignee}</Typography>}
            </CardContent>
            {isAdmin() && (
              <CardActions>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleUpdateTask(task.task_id, "COMPLETED")}
                >
                  Mark as Completed
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => handleDeleteTask(task.task_id)}
                >
                  Delete Task
                </Button>
              </CardActions>
            )}
          </Card>
        ))
      )}
    </Grid>
  );

  if (auth.isLoading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (auth.error) {
    return (
      <Typography variant="h6" color="error">
        Encountering error... {auth.error.message}
      </Typography>
    );
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
            Welcome, {auth.user?.profile.email}
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
