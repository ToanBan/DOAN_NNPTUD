import api from "../../lib/axios"

const getPostsForum = async(forumId:string) => {
  try {
    const response = await api.get(`/api/posts/forum/${forumId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return [];
  }
}

export default getPostsForum
