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

    // Group files by message _id
    const fileMap = new Map();
    files.forEach((f) => {
      const msgId = String(f.message);
      if (!fileMap.has(msgId)) {
        fileMap.set(msgId, []);
      }
      fileMap.get(msgId).push({
        url: f.fileUrl,
        type: f.fileType,
        name: f.fileName,
        size: f.fileSize,
      });
    });

    // ✅ merge
    const result = messages.map((msg) => ({
      ...msg,
      files: fileMap.get(String(msg._id)) || [],
    }));

    res.json({ messages: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const UploadMessageFile = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Không có file nào được upload" });
    }

    const uploadedFiles = req.files.map((file) => ({
      url: `${process.env.URL_UPLOADS}messages/${file.filename}`,
      type: file.mimetype,
      name: file.originalname,
      size: file.size,
    }));

    res.json({ files: uploadedFiles });
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
