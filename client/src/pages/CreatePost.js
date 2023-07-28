import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../components/Editor";
import { UserContext } from "../contexts/UserContext";
import { useContext } from "react";
import { toast } from "react-toastify";

export default function CreatePost() {
  const { user } = useContext(UserContext);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [redirect, setRedirect] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const response = await fetch("/createPost", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({title,summary,content,image}),
      credentials: "include",

    });
    if (response.ok) {
      setRedirect(true);
      toast.success('New Post Created Successfully', {
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
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const base64 = await convertToBase64(file);
    console.log(base64)
    setImage(base64 )
  }

  function convertToBase64(file){
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result)
      };
      fileReader.onerror = (error) => {
        reject(error)
      }
    })
  }

  if (!user) {
    return <Navigate to={"/login"} />;
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <form className="createPost" onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        type="text"
        placeholder="Title"
      />
      <input
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        type="text"
        placeholder="Summary"
      />
      <input type="file" accept='.jpeg, .png, .jpg' onChange={(e) => handleFileUpload(e)} />
      <Editor value={content} onChange={setContent} />
      <button className="btn-style" type="submit" style={{ marginTop: "15px" }}>
        Create Post
      </button>
    </form>
  );
}
