import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../context/authContext";
import ContextProfile from "../components/ContextProfile";
import { useParams } from "react-router-dom";
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
  const { id } = useParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const { user, accessToken } = useUser();
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0 });
  const [relationshipAction, setRelationshipAction] = useState<string>("Self");
  const [loading, setLoading] = useState<boolean>(true);

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

  const fetchProfile = useCallback(
    async (showLoading = true) => {
      if (!user) return;

      try {
        if (showLoading) setLoading(true);
        const targetId = id || user._id; 
        const res = await api.get(`/api/users/profile/${targetId}`);
        setProfileData(res.data.user);
        setStats(res.data.stats);
        setRelationshipAction(res.data.relationship);
      } catch (error) {
        console.error("Lỗi khi tải profile:", error);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [id, user],
  );

  useEffect(() => {
    fetchProfile(true);
  }, [fetchProfile]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-slate-400">
        Loading profile...
      </div>
    );
  }

  const handleFollowToggle = async () => {
    try {
      const targetId = id || user._id;
      await api.post(`/api/users/follow/${targetId}`);
      // Refresh profile sau khi follow/unfollow
      await fetchProfile(false);
    } catch (error) {
      console.error("Lỗi khi toggle follow:", error);
    }
  };

  return (
    <ContextProfile
      user={profileData}
      myself={relationshipAction === "Self"}
      posts={posts}
      stats={stats}
      relationshipAction={relationshipAction}
      onToggleFollow={handleFollowToggle}
    />
  );
};

export default Profile;
