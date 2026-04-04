import api from "../../lib/axios"

const getMyForum = async() => {
    try {
        const res = await api.get("/api/forums/my-forums");
        return res.data.forums || [];
    } catch (error) {
        console.error("Error fetching my forums:", error);
        return [];
    }
}

export default getMyForum
