import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['todo', 'in_progress', 'review', 'done', 'blocked'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    dependencies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    dueDate: Date,
    startDate: Date,
    completedAt: Date,
    estimatedHours: {
        type: Number,
        default: 0
    },
    spentHours: {
        type: Number,
        default: 0
    },
    attachments: [{
        filename: String,
        url: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    archived: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Text search index
taskSchema.index({ title: 'text', description: 'text' });

// Compound index for efficient querying by project and status
taskSchema.index({ project: 1, status: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;