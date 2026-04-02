import api from "../../lib/axios";

const handleDeleteForum = async (forumId: string) => {
  try {
    const res = await api.delete(`/api/forums/${forumId}`);
    return res.data;
  } catch (error) {
    console.error("handleDeleteForum error:", error);
    throw error;
  }
};

export default handleDeleteForum;