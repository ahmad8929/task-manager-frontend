import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { toast } from 'react-toastify';
import { FaToggleOn, FaToggleOff, FaEdit, FaTrash } from 'react-icons/fa';

const Dashboard = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await axios.get("https://task-manager-backend-sdu9.onrender.com/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    }
  };

  const addTask = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Both title and description are required");
      return;
    }

    try {
      await axios.post("https://task-manager-backend-sdu9.onrender.com/api/tasks", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ title: "", description: "" });
      fetchTasks();
      toast.success("Task added successfully");
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  const updateTask = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Both title and description are required");
      return;
    }

    try {
      await axios.put(`https://task-manager-backend-sdu9.onrender.com/api/tasks/${editingId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ title: "", description: "" });
      setEditingId(null);
      fetchTasks();
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleSubmit = () => {
    if (editingId) {
      updateTask();
    } else {
      addTask();
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      await axios.put(`https://task-manager-backend-sdu9.onrender.com/api/tasks/${id}`, { completed: !completed }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
      toast.success("Task status updated");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (id) => {
    // if (window.confirm("Are you sure you want to delete this task?")) {
    try {
      await axios.delete(`https://task-manager-backend-sdu9.onrender.com/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
    // }
  };

  const startEditing = (task) => {
    setForm({ title: task.title, description: task.description });
    setEditingId(task._id);
  };

  const cancelEditing = () => {
    setForm({ title: "", description: "" });
    setEditingId(null);
  };

  useEffect(() => { fetchTasks(); }, []);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-2xl mb-4 font-bold">Your Tasks</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Title*"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border p-2 w-full mb-2"
          required
        />
        <textarea
          placeholder="Description*"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 w-full mb-2 h-20"
          required
        />
        <div className="flex space-x-2">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingId ? "Update Task" : "Add Task"}
          </button>
          {editingId && (
            <button
              onClick={cancelEditing}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task._id} className="border p-2 mb-2 flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{task.title}</h4>
              <p className="whitespace-pre-wrap">{task.description}</p>
              <small>{task.completed ? "✅ Completed" : "❌ Incomplete"}</small>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleTask(task._id, task.completed)}
                className="text-2xl"
              >
                {task.completed ? <FaToggleOn className="text-green-500" /> : <FaToggleOff />}
              </button>
              <button
                onClick={() => startEditing(task)}
                className="text-blue-500 text-xl"
              >
                <FaEdit />
              </button>
              {/* <button 
                onClick={() => deleteTask(task._id)} 
                className="text-red-500 text-xl"
              >
                <FaTrash />
              </button> */}

              {confirmDeleteId === task._id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      deleteTask(task._id);
                      setConfirmDeleteId(null);
                    }}
                    className="bg-red-600 text-white px-2 py-1 text-sm rounded"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="bg-gray-400 text-white px-2 py-1 text-sm rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(task._id)}
                  className="text-red-500 text-xl"
                >
                  <FaTrash />
                </button>
              )}

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;