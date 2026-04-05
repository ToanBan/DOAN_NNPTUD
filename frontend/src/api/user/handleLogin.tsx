import { API_URL } from "../../lib/config";

const handleLogin = async (email: string, password: string) => {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default handleLogin;
