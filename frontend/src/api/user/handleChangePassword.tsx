import api from "../../lib/axios";

const handleChangePassword = async (
  oldPassword: string,
  newPassword: string,
  confirmNewPassword: string,
) => {
  try {
    const res = await api.post("/api/auth/changepassword", {
      oldPassword,
      newPassword,
      confirmNewPassword,
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default handleChangePassword;
