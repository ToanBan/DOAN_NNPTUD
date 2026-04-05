import api from "../../lib/axios"
const getAllForum = async () => {
  try {
    const response = await api.get(`/api/admin/forums`);
    return response.data.forums;
  } catch (error) {
    console.error("getAllForum error:", error);
    return null;
  }
}

export default getAllForum
