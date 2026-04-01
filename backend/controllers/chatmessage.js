const ChatMessage = require("../schemas/chatmessage");
const MessageFile = require("../schemas/message_file");

const GetMessagesByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const friendId = req.params.friendId;

    const messages = await ChatMessage.find({
      $or: [
        { sender: userId, receiver: friendId },
        { sender: friendId, receiver: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    // ✅ lấy file
    const messageIds = messages.map((m) => m._id);

    const files = await MessageFile.find({
      message: { $in: messageIds },
    }).lean();

    const fileMap = new Map(files.map((f) => [String(f.message), f]));

    // ✅ merge
    const result = messages.map((msg) => ({
      ...msg,
      fileUrl: fileMap.get(String(msg._id))?.fileUrl || null,
      fileType: fileMap.get(String(msg._id))?.fileType || null,
    }));

    res.json({ messages: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const UploadMessageFile = async (req, res) => {
  try {
    const fileUrl = `${process.env.URL_UPLOADS}messages/${req.file.filename}`;
    res.json({
      url: fileUrl,
      type: req.file.mimetype,
    });
  } catch (err) {
    res.status(500).json({ message: "Upload lỗi" });
  }
};

const DownloadMessageFile = async (req, res) => {
  try {
    const { filename } = req.params;

    const filePath = path.join(
      __dirname,
      "../public/uploads/messages",
      filename,
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File không tồn tại" });
    }

    res.download(filePath); 
  } catch (err) {
    res.status(500).json({ message: "Download lỗi" });
  }
};

module.exports = {
  GetMessagesByUserId,
  UploadMessageFile,
  DownloadMessageFile,
};
