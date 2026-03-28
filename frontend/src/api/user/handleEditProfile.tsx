import api from "../../lib/axios";

const handleEditProfile = async (
  phone: string,
  description: string,
  address: string,
  username: string,
) => {
  try {
    const res = await api.post("/api/auth/editprofile", {
      phone,
      description,
      address,
      username,
    });

    console.log(res.data);
    return res.data;
  } catch (error: any) {
    console.error(error.response.data.message);
    return null;
  }
};

export default handleEditProfile;
