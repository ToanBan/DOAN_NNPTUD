import api from "../../lib/axios"

const getForumCreated = async (userId?: string) => {
  try {
    const res = await api.get("/api/forums/created-by-me", {
        params: userId ? { userId } : {}
    });
    return res.data.forums || [];
  } catch (error) {
    console.error("Error fetching forums created:", error);
    return [];
  }
}

export default getForumCreated;