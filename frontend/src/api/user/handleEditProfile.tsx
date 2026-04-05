import api from "../../lib/axios";

const handleEditProfile = async (
  phone: string,
  description: string,
  address: string,
  username: string,
  avatarFile?: File | null // Thêm tham số này
) => {
  try {
    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("description", description);
    formData.append("address", address);
    formData.append("username", username);
    
    if (avatarFile) {
      formData.append("avatar", avatarFile); 
    }

    const res = await api.post("/api/auth/editprofile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error: any) {
    console.error(error.response?.data?.message);
    return null;
  }
};

export default handleEditProfile;