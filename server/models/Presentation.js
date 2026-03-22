import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
  title: { type: String },
  content: [{ type: String }],
});

const presentationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
  title: { type: String },
  subtitle: { type: String },
  slides: [slideSchema],
}, { timestamps: true });

export default mongoose.model('Presentation', presentationSchema);
