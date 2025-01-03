import React from "react";

const TaskList = ({ tasks }) => {
  console.log({tasks})
  return (
    <div>
      <h2>Task List</h2>
      {tasks.length === 0 ? (
        <p>No tasks available</p>
      ) : (
        tasks.map((task) => (
          <div key={task.task_id}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            <p>Deadline: {task.deadline}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;

