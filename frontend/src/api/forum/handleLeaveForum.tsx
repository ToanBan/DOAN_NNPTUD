import api from "../../lib/axios";

const handleLeaveForum = async (forumId: string) => {
  const response = await api.delete(`/api/forums/${forumId}/leave`);
  return response.data;
};

export default handleLeaveForum;