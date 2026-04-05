import api from "../../lib/axios"

const getMyForum = async (userId?: string) => {
    try {

        const res = await api.get("/api/forums/my-forums", {
            params: userId ? { userId } : {}
        });
        return res.data.forums || [];
    } catch (error) {
        console.error("Error fetching forums:", error);
        return [];
    }
}

export default getMyForum;