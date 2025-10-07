import mongoose from "mongoose";

const { Schema } = mongoose;

const activitySchema = new Schema({
  action: { 
    type: String, 
    required: true 
  },
  entityType: { 
    type: String, 
    enum: ['Project', 'Task', 'User', 'Finance', 'Resource'], 
    required: true 
  },
  entityId: { 
    type: Schema.Types.ObjectId, 
    required: true 
  },
  message: { 
    type: String 
  },
  project: { 
    type: Schema.Types.ObjectId, 
    ref: 'Project' 
  },
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  metadata: { 
    type: Object, 
    default: {} 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create compound index for entityType + entityId
activitySchema.index({ entityType: 1, entityId: 1 });

// Create index for fast recent-activity queries
activitySchema.index({ createdAt: -1 });

// Create index for project-based queries
activitySchema.index({ project: 1, createdAt: -1 });

// Create index for user-based queries
activitySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);