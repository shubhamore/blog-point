import React, { createContext, useState, useEffect } from "react";

export const LikeContext = createContext();

export default function LikeContextProvider({ children }) {
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    fetch("/likedposts", {
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    })
      .then((data) => data.json())
      .then((data) =>
        setLikedPosts(data.length > 0 ? data.map((post) => post._id) : [])
      );
  }, []);

  const toggleLikedPost = (postId) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
    }
  };

  return (
    <LikeContext.Provider value={{ likedPosts, toggleLikedPost }}>
      {children}
    </LikeContext.Provider>
  );
}
