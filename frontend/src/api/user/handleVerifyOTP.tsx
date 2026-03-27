import api from "../../lib/axios";

const handleVerifyOTP = async (otps: string[], token:string) => {
  try {
    const res = await api.post("/api/auth/verifyotp", { otps, token});
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default handleVerifyOTP;
