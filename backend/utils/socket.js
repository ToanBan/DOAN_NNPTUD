const { Server } = require("socket.io");

let io;

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:5173",
        credentials: true
      }
    });

    io.on("connection", (socket) => {
      console.log("Client connected via socket:", socket.id);

      // Khi người dùng đăng nhập, họ sẽ emit sự kiện join kèm theo userId
      socket.on("join", (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined their personal room.`);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  }
};
