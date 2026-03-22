import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { 
    type: String, 
    enum: ['user', 'assistant'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  presentationData: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null },
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    default: 'New Chat' 
  },
  messages: [messageSchema],
  currentPresentation: { 
    type: mongoose.Schema.Types.Mixed, 
    default: null 
  },
}, { timestamps: true });

export default mongoose.model('Chat', chatSchema);
