import api from "../../lib/axios";

const handleJoinForum = async (forumId: string) => {
  const response = await api.post(`/api/forums/${forumId}/join`);
  return response.data;
};

export default handleJoinForum;