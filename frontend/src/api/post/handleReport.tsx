import api from "../../lib/axios";

export const submitReport = async (postId: string, reason: string, description?: string) => {
  try {
    const response = await api.post("/api/reports", {
      postId,
      reason,
      description
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to submit report" };
  }
};

export const getReports = async (status?: string, page?: number, limit?: number) => {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const response = await api.get(`/api/reports?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch reports" };
  }
};

export const updateReportStatus = async (reportId: string, status: string, adminNote?: string) => {
  try {
    const response = await api.put(`/api/reports/${reportId}`, {
      status,
      adminNote: adminNote || ""
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to update report status" };
  }
};

export const getReportStats = async () => {
  try {
    const response = await api.get("/api/reports/stats");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch report statistics" };
  }
};

// Post actions for admin
export const hidePost = async (postId: string, reason: string) => {
  try {
    const response = await api.put(`/api/posts/${postId}/hide`, {
      reason
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to hide post" };
  }
};

export const deletePost = async (postId: string, reason: string) => {
  try {
    const response = await api.put(`/api/posts/${postId}/delete`, {
      reason
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to delete post" };
  }
};

export const restorePost = async (postId: string) => {
  try {
    const response = await api.put(`/api/posts/${postId}/restore`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to restore post" };
  }
};

// Get hidden/deleted posts for admin management
export const getHiddenPosts = async (page?: number, limit?: number) => {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const response = await api.get(`/api/posts/hidden?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: "Failed to fetch hidden posts" };
  }
};
