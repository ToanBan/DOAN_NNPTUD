import api from "../../lib/axios"
const handleForgotPassword = async(email:string) => {
  try {
    const res = await api.post("/api/auth/forgotpassword", {email})
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default handleForgotPassword
