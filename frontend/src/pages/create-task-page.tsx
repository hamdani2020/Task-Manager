import { useState, useEffect } from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API_URLS } from "@/constants";
import { Button } from "@/components/ui/button";
import Loading from "@/components/loading";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router";


const CreateTaskPage = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [error, setError] = useState("");
  const navigateTo = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [deadline, SetDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(
          "https://vwjwg4yut4.execute-api.eu-west-1.amazonaws.com/user"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch team members");
        }
        const data = await response.json();
        setTeamMembers(data.users || []);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleCreateTask = async () => {
    setIsLoading(true);
    const newTask = {
      title,
      description,
      assignee,
      deadline,
      status: "PENDING"
    };
    


    try {
      const response = await axios.post(API_URLS.createTask, newTask, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Task created:", response.data);

      setError("");
    } catch (err) {
      setError("Failed to create task");
    }

    setIsLoading(false);
  };

  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create Task</CardTitle>
              <CardDescription>
                Create and assign task to members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateTask();
                }}
              >
                <div>
                  <label htmlFor="title">Title</label>
                  <Input required disabled={isLoading} placeholder="Enter title" id="title" onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="description">Description</label>
                  <Textarea
                    placeholder="Enter description"
                    id="description"
                    onChange={(e) => setDescription(e.target.value)}
                    required disabled={isLoading}
                  />
                </div>
                <div>
                  <label htmlFor="assignee">Assignee</label>
                  <Select required disabled={isLoading} onValueChange={(value) => setAssignee(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a member" />
                    </SelectTrigger>
                    <SelectContent id="assignee">
                      {teamMembers.map((member: any) => (
                        <SelectItem key={member?.email} value={member?.email}>
                          {member?.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label htmlFor="date">Deadline</label>
                  <Input required disabled={isLoading} onChange={(e) => SetDeadline(e.target.value)} type="date" id="date" />
                </div>
                <Button
                  type="submit" disabled={isLoading}
                  onClick={() => navigateTo("/dashboard")}
                >
                  {isLoading ? <Loading small={true} /> : "Create Task"}
                </Button>
              </form>
              {error && <p className="text-red-500">{error}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskPage;
