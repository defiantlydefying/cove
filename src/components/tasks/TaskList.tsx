"use client";

import { useEffect, useState } from "react";
import TaskInput from "./TaskInput";
import TaskItem, { Task } from "./TaskItem";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAdd(title: string) {
    const tempId = `temp-${Date.now()}`;
    const newTask: Task = { id: tempId, title, completed: false };
    setTasks((prev) => [newTask, ...prev]);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const created = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === tempId ? created : t)));
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== tempId));
    }
  }

  async function handleToggle(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      const task = tasks.find((t) => t.id === id);
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task?.completed }),
      });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    }
  }

  async function handleDelete(id: string) {
    const prev = tasks;
    setTasks((curr) => curr.filter((t) => t.id !== id));

    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch {
      setTasks(prev);
    }
  }

  if (loading) {
    return <p className="text-sm text-white/50">Loading tasks...</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="font-medium text-sm text-white/90">Tasks</p>
      <TaskInput onAdd={handleAdd} />
      <div className="flex flex-col divide-y divide-white/10">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        ))}
      </div>
      {tasks.length === 0 && (
        <p className="text-xs text-white/40">No tasks yet.</p>
      )}
    </div>
  );
}
