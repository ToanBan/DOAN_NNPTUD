import api from "../../lib/axios";
const getMessageByUser = async(friendId: string) => {
  try {
    const res = await api.get(`/api/chatmessages/messages/${friendId}`);

    const formatted = res.data.messages.map((msg: any) => ({
      senderId: msg.sender,
      receiverId: msg.receiver,
      content: msg.content,
      files: msg.files,
      createdAt: msg.createdAt,
    }));

    return formatted;
  } catch (error) {
    console.error("Lỗi load message:", error);
    throw error;
  }
};

export default getMessageByUser;
