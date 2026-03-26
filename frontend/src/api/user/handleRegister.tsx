const handleRegister = async (
  username: string,
  fullname: string,
  email: string,
  password: string,
  confirmPassword: string,
) => {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/register`,
      {
        method: "POST",
        body: JSON.stringify({ username, fullname ,email, password, confirmPassword }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res.json();
    if (!res.ok) {
      return { success: false, ...data };
    }
    return { success: true, ...data };
  } catch (error) {
    console.error(error);
    return { success: false, errors: ["Đăng ký thất bại, vui lòng thử lại"] };
  }
};

export default handleRegister;
