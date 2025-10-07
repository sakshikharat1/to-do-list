// server.js - Fixed Backend

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection - REPLACE WITH YOUR ACTUAL PASSWORD AND DATABASE NAME
const MONGODB_URI = 'mongodb+srv://todo-user:idk0119@cluster0.yzkplvl.mongodb.net/todolist?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Task Schema - Added date field
const taskSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add virtual 'id' field to match frontend
taskSchema.virtual('id').get(function() {
    return this._id.toString();
});

// Ensure virtuals are included when converting to JSON
taskSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.id = ret._id.toString();
        return ret;
    }
});

const Task = mongoose.model('Task', taskSchema);

// Routes

// Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new task
app.post('/api/tasks', async (req, res) => {
    const task = new Task({
        text: req.body.text,
        date: req.body.date || new Date().toISOString().split('T')[0],
        completed: req.body.completed || false
    });

    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a task
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (req.body.text != null) {
            task.text = req.body.text;
        }
        if (req.body.date != null) {
            task.date = req.body.date;
        }
        if (req.body.completed != null) {
            task.completed = req.body.completed;
        }

        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        await task.deleteOne();
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete all tasks
app.delete('/api/tasks', async (req, res) => {
    try {
        await Task.deleteMany({});
        res.json({ message: 'All tasks deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});