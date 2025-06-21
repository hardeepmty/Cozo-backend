const Message = require('../models/Message');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { content, chatType, chatId } = req.body;

    const message = await Message.create({
      sender: req.user._id,
      content,
      chatType,
      chatId,
      organization: req.params.orgId
    });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get messages
exports.getMessages = async (req, res) => {
  try {
    const { chatType, chatId } = req.query;

    const messages = await Message.find({
      chatType,
      chatId,
      organization: req.params.orgId
    })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};