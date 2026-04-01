const fs = require("fs");
const path = require("path");
const multer = require("multer");

const createUploader = (folder) => {
  const uploadDir = path.join(__dirname, `../public/uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "");
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
  });
};

module.exports = createUploader;