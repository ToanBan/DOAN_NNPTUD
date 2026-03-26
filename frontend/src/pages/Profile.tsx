import React, { useState, useEffect } from "react";
import { useUser } from "../context/authContext";
import ContextProfile from "../components/ContextProfile";

interface Post {
  id: number;
  content: string;
  fileUrl: string;
  type: string;
}

const Profile: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const { user } = useUser();



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