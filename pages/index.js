import {
  Box,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { IoSend } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import ReactScrollToBottom from "react-scroll-to-bottom";

const socket = io("https://server-kpva.onrender.com");

export default function Home() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const textRef = useRef();
  const [length, setLength] = useState(50);
  const [button, setButton] = useState("Read more");

  useEffect(() => {
    const handleUserJoined = (data) => {
      console.log(data);
      // alert(data.message);
    };

    socket.on("userJoined", handleUserJoined);

    return () => {
      socket.off("userJoined", handleUserJoined);
    };
  }, []);

  useEffect(() => {
    const message = (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: data, side: "left", bgcol: "whitesmoke" },
      ]);
    };
    socket.on("message", message);

    return () => {
      socket.off("message", message);
    };
  }, []);

  useEffect(() => {
    const message = (data) => {
      const decodedData = decodeURIComponent(data.Url);

      if (data.type.startsWith("audio")) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            audio: decodedData,
            type: data.type,
            side: "left",
            bgcol: "transparent",
          },
        ]);
      } else if (data.type.startsWith("video")) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            video: decodedData,
            type: data.type,
            side: "left",
            bgcol: "transparent",
          },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            images: decodedData,
            type: data.type,
            side: "left",
            bgcol: "transparent",
          },
        ]);
      }
    };
    socket.on("image-file", message);

    return () => {
      socket.off("image-file", message);
    };
  }, []);

  const onsubmit = () => {
    if (text.length === 0) return;
    socket.emit("someswar", text);
    textRef.current.value = "";
    textRef.current.focus();
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: text, side: "right", bgcol: "rgb(184 127 225);" },
    ]);
    setText("");
  };

  const handleChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        const encodedData = encodeURIComponent(base64String);

        if (file.type.startsWith("audio")) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              audio: base64String,
              type: file.type,
              side: "right",
              bgcol: "transparent",
            },
          ]);
        } else if (file.type.startsWith('video')) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              video: base64String,
              type: file.type,
              side: "right",
              bgcol: "transparent",
            },
          ]);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              images: base64String,
              type: file.type,
              side: "right",
              bgcol: "transparent",
            },
          ]);
        }

        socket.emit("image-file", { Url: encodedData, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Typography
        id="header"
        className="text-center p-2 bg-purple-700 text-white"
        sx={{
          clear: "both",
          fontSize: "1.2rem",
          fontFamily: "math",
          position: "fixed",
          width: "100vw",
          zIndex: "200",
        }}
      >
        Online Chat App
      </Typography>

      <ReactScrollToBottom
        className="message-container"
        
        style={{
          flex: 1,
          padding: "1rem",
          marginTop: "3rem",
          overflowY: "auto",
          backgroundColor:"red"
        }}
      >
        {messages.map((data, index) => (
          <Box
            key={index}
            sx={{
              height: "auto",
              float: data.side,
              clear: "both",
              marginBottom: "15px",
              fontSize: "1.2rem",
              backgroundColor: data.bgcol,
              borderRadius: "15px",
              padding: "7px",
              justifyItem: data.side === "right" ? "flex-end" : "flex-start",
            }}
          >
            {data?.audio ? (
              <audio controls >
                <source
                  src={`data:${data.type};base64,${data.audio}`}
                  type={data.type}
                />
                Your browser does not support the audio tag.
              </audio>
            ) : data?.images ? (
              <img
                src={`data:${data.type};base64,${data.images}`}
                alt=""
                style={{
                  width: "300px",
                  height: "auto",
                  borderRadius: "15px",
                  padding: "4px",
                  backgroundColor: "#343f46",
                }}
              />
            ) : data?.video ? (
              
              <video controls style={{borderRadius:"25px",width:"300px",height:"auto", padding: "4px",
              backgroundColor: "#343f46"}}>
                <source src={`data:video/mp4;base64,${data.video}`}>
                </source>
                </video>
            ) : (
              <Typography variant="body2">
                {data?.message?.length > 70 ? (
                  <Box>
                    <p style={{ wordBreak: "break-all", fontWeight: 100 }}>
                      {data?.message?.slice(0, length)}...
                    </p>
                    <p
                      onClick={() => {
                        setLength(data?.message?.length);
                        setButton("");
                      }}
                      className="text-blue-700"
                    >
                      {button}
                    </p>
                  </Box>
                ) : data?.message?.startsWith("https://") ||
                  data?.message?.endsWith(".com") ? (
                  <Box>
                    <a
                      href={data?.message}
                      target="_blank"
                      rel="noreferrer"
                      className="cursor-pointer text-blue-700"
                    >
                      {data?.message}
                    </a>
                  </Box>
                ) : (
                  <span>{data?.message}</span>
                )}
              </Typography>
            )}
          </Box>
        ))}
      </ReactScrollToBottom>

      <Box
        className="input-container"
        sx={{
          display: "flex",
          position:"fixed",
          bottom:"5%",
          alignItems: "center",
          padding: "10px",
          backgroundColor: "#fffff",
          width:"100vw",
          zIndex:1000
        }}
      >
        <TextField
          id="outlined-basic"
          label="Enter your message..."
          variant="outlined"
          fullWidth
          inputRef={textRef}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onsubmit()}
        />
        <button
          onClick={onsubmit}
          style={{
            marginLeft: "10px",
            padding: "10px",
            borderRadius: "50%",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          <IoSend />
        </button>
        <label htmlFor="file-input" style={{ marginLeft: "10px", cursor: "pointer" }}>
          <IoIosLink size={24} />
        </label>
        <input
          id="file-input"
          type="file"
          style={{ display: "none" }}
          onChange={handleChange}
        />
      </Box>
    </Box>
  );
}
