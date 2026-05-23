import WeddingSupportTicket from '../models/WeddingSupportTicket.js';

export const getTickets = async (req, res) => {
  try {
    const tickets = await WeddingSupportTicket.find().sort({ createdAt: -1 });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await WeddingSupportTicket.findByIdAndUpdate(id, { status: 'Resolved' }, { new: true });
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveAllTickets = async (req, res) => {
  try {
    await WeddingSupportTicket.updateMany({ status: { $ne: 'Resolved' } }, { status: 'Resolved' });
    res.status(200).json({ success: true, message: 'All tickets resolved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    const count = await WeddingSupportTicket.countDocuments();
    const ticketId = `TK-${450 + count + 1}`;
    const newTicket = await WeddingSupportTicket.create({ ...req.body, ticketId });
    res.status(201).json({ success: true, data: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const ticket = await WeddingSupportTicket.findByIdAndUpdate(
      id, 
      { 
        adminReply: reply, 
        adminRepliedAt: new Date(),
        status: 'In Progress' 
      }, 
      { new: true }
    );
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const ticket = await WeddingSupportTicket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMySupportTickets = async (req, res) => {
  try {
    const userId = req.user._id;
    const tickets = await WeddingSupportTicket.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
