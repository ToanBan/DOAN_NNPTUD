import api from "../../lib/axios";

const handleEditForum = async (forumId: string, data: any) => {
  try {
    const res = await api.put(`/api/forums/${forumId}`, data);
    return res.data;
  } catch (error) {
    console.error("handleEditForum error:", error);
    throw error;
  }
};

export default handleEditForum;