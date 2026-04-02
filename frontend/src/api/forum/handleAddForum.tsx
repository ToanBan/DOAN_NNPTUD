import api from "../../lib/axios";

const handleAddForum = async (payload: any) => {
  try {
    const res = await api.post("/api/forums", payload);
    return res.data;
  } catch (error) {
    console.error("handleAddForum error:", error);
    return null;
  }
};

export default handleAddForum;