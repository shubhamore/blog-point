import React, { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { toast } from "react-toastify";

export default function Header() {
  const { user, setUser } = useContext(UserContext);
  useEffect(() => {
    fetch("/profile", {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((data) => data.json())
      .then((data) => setUser(data.username));
  }, []);

  function logout() {
    fetch("/logout", {
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    setUser(null);
    toast.success("Logout Successfull", {
      position: "top-center",
      autoClose: 2500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  }

  return (
    <header style={{ display: "flex", flexWrap: "wrap" }}>
      <Link to="/" className="logo">
        BlogPoint
      </Link>
      <nav>
        {user ? (
          <>
            <Link to="/favourite">Favourites</Link>
            <Link to="/myposts">My Posts</Link>
            <Link to="/create">Create Post</Link>
            <a style={{ color: "red", fontWeight: "700" }} onClick={logout}>
              Logout
            </a>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
