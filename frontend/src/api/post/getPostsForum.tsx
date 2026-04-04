import api from "../../lib/axios"

const getPostsForum = async(forumId:string) => {
  try {
    const response = await api.get(`/api/posts/forum/${forumId}`);
    console.log("Fetched posts for forum", forumId, ":", response);
    return response;
  } catch (error) {
    console.error("Error fetching forum posts:", error);
    return [];
  }
}

export default getPostsForum
