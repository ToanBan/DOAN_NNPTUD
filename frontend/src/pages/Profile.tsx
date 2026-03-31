import React, { useState, useEffect } from "react";
import { useUser } from "../context/authContext";
import ContextProfile from "../components/ContextProfile";
import api from "../lib/axios";

interface Post {
  postId: string;
  content: string;
  fileUrl: string;
  fileType: string | null;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  createdAt?: string;
  isShared?: boolean;
  sharedPost?: {
    postId: string;
    content: string;
    username: string;
    avatar: string;
    fileUrl: string;
    fileType: string | null;
    createdAt?: string;
  } | null;
}

const Profile: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await api.get("/api/posts/me");
        setPosts(res.data.posts || []);
      } catch (_error) {
        setPosts([]);
      }
    };

    if (user?._id) {
      fetchMyPosts();
    }
  }, [user?._id]);



  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-slate-400">
        Loading profile...
      </div>
    );
  }

  return (
    <ContextProfile
      user={user}
      myself={true}
      posts={posts}
    />
  );
};

export default Profile;