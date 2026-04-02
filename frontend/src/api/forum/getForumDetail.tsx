import api from "../../lib/axios"
const getForumDetail = async (forumId: string) => {
  try {
    const response = await api.get(`/api/forums/${forumId}`);
    return response.data;
  } catch (error) {
    console.error("getForumDetail error:", error);
    return null;
  }
}

export default getForumDetail
