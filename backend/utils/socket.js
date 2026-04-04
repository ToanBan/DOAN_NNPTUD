const { Server } = require("socket.io");
const mongoose = require("mongoose");

const ChatMessage = require("../schemas/chatmessage");
const Notification = require("../schemas/notification");
const MessageFile = require("../schemas/message_file");

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join", (userId) => {
        socket.join(userId);
      });

      socket.on("sendMessage", async (data) => {
        const session = await mongoose.startSession();

        try {
          session.startTransaction();

          const {
            senderId,
            receiverId,
            content,
            files = [],
          } = data;

          const [newMessage] = await ChatMessage.create(
            [
              {
                sender: senderId,
                receiver: receiverId,
                content,
              },
            ],
            { session }
          );

          let messageFiles = [];

          if (files && files.length > 0) {
            const fileDocs = files.map((f) => ({
              message: newMessage._id,
              fileUrl: f.url,
              fileType: f.type || "file",
              fileName: f.name || "",
              fileSize: f.size || 0,
            }));

            messageFiles = await MessageFile.insertMany(fileDocs, { session });
          }

          let newNotification = null;

          if (senderId !== receiverId) {
            const [createdNotification] = await Notification.create(
              [
                {
                  sender: senderId,
                  receiver: receiverId,
                  type: "chat_message",
                },
              ],
              { session }
            );

            newNotification = createdNotification;
          }

          await session.commitTransaction();
          session.endSession();

          if (newNotification) {
            await newNotification.populate("sender", "username avatar");
          }

          const messageData = {
            _id: newMessage._id,
            senderId,
            receiverId,
            content,
            files: messageFiles.map((f) => ({
              url: f.fileUrl,
              type: f.fileType,
              name: f.fileName,
              size: f.fileSize,
            })),
            createdAt: newMessage.createdAt,
          };

          io.to(receiverId).emit("receiveMessage", messageData);
          io.to(senderId).emit("receiveMessage", messageData);

          if (newNotification) {
            io.to(receiverId).emit("new_notification", newNotification);
          }

        } catch (err) {
          await session.abortTransaction();
          session.endSession();
          console.error("Transaction lỗi:", err);
        }
      });

      socket.on("disconnect", () => {
        console.log("Disconnected:", socket.id);
      });
    });

    return io;
  },

  getIO: () => {
    if (!io) throw new Error("Socket chưa init");
    return io;
  },
};