import mongoose from 'mongoose';

const weddingSupportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  user: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  subject: { type: String, required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Critical', 'Resolved'], default: 'Open' },
  priority: { type: Number, default: 2 }, // 1=Critical, 2=Normal, 3=Low
  adminReply: { type: String, default: '' },
  adminRepliedAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('WeddingSupportTicket', weddingSupportTicketSchema);

