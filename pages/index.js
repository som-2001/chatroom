import { Box, TextField, Typography } from "@mui/material";
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
  const [copy, setCopy] = useState('');

  const hour = new Date().getHours();
  const minute = new Date().getMinutes();

  useEffect(() => {
    const handleUserJoined = (data) => {
      console.log(data);
    };

    socket.on("userJoined", handleUserJoined);

    return () => {
      socket.off("userJoined", handleUserJoined);
    };
  }, []);

  useEffect(() => {
    const message = (data) => {
      console.log(data);
      setMessages((prevMessages) => [
        ...prevMessages,
        { message: data.text, side: "left", bgcol: "#5D4EAC", copyMessage: data.copy },
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
    socket.emit("someswar", { text, copy });
    console.log(copy);
    textRef.current.value = "";
    textRef.current.focus();
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: text, side: "right", bgcol: "#8f8f8f", copyMessage: copy },
    ]);
    setText("");
    setCopy('');
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
        } else if (file.type.startsWith("video")) {
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

  const handleDoubleClick = (message) => {
    console.log(message)
    setCopy(message);
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", position: "fixed", width: "100vw" }}>
      <Typography
        id="header"
        className="text-center bg-purple-700 text-white"
        sx={{
          clear: "both",
          fontSize: "1.7rem",
          fontFamily: "math",
          position: "fixed",
          width: "100vw",
          zIndex: "200",
        }}
      >
        {new Date().getHours()}:{new Date().getMinutes()}
      </Typography>

      <ReactScrollToBottom className="message-container">
        {messages.map((data, index) => (
          <Box
            key={index}
            sx={{
              height: "auto",
              float: data.side,
              clear: "both",
              marginBottom: "5px",
              fontSize: "1.2rem",
              backgroundColor: data.bgcol,
              borderRadius: "10px",
              padding: "7px",
              minWidth: "30%",
              wordBreak: 'break-all',
              justifyItem: data.side === "right" ? "flex-end" : "flex-start",
            }}
            onClick={() => handleDoubleClick(data.message)}
          >
            {data?.audio ? (
              <audio controls>
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
              <video
                controls
                style={{
                  borderRadius: "25px",
                  width: "300px",
                  height: "auto",
                  padding: "4px",
                  backgroundColor: "#343f46",
                }}
              >
                <source src={`data:video/mp4;base64,${data.video}`}></source>
              </video>
            ) : (
              <Typography variant="body2">
                <p
                      style={{
                        wordBreak: "break-all",
                        fontWeight: 100,
                        fontSize: "0.9rem",
                      }}>
                      {data?.copyMessage?.slice(0,50)}
                    </p>
                {data?.message?.length > 70 ? (
                  <Box>
                    
                    <p
                      style={{
                        wordBreak: "break-all",
                        fontWeight: 100,
                        fontSize: "1.2rem",
                      }}
                      className="text-white"
                    >
                      {data?.message?.slice(0, length)}...
                    </p>
                    <p
                      onClick={() => {
                        setLength(data?.message?.length);
                        setButton("");
                      }}
                      className="text-blue-600"
                    >
                      Read more
                    </p>
                    <p
                      className="text-sm text-white"
                      style={{ float: "right", clear: "both" }}
                    >
                      {hour}:{minute}
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
                    <p
                      className="text-sm text-white"
                      style={{ float: "right", clear: "both" }}
                    >
                      {hour}:{minute}
                    </p>
                  </Box>
                ) : (
                  <Box>
                    <p className="text-xl text-white">{data?.message}</p>
                    <p
                      className="text-sm text-white"
                      style={{ float: "right", clear: "both" }}
                    >
                      {hour}:{minute}
                    </p>
                  </Box>
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
          position: "fixed",
          bottom: "0%",
          alignItems: "center",
          padding: "10px",
          backgroundColor: "#fffff",
          width: "100vw",
          zIndex: 1000,
          marginTop: "10px"
        }}
      >
        <TextField
          id="outlined-basic"
          label="Enter your message"
          variant="outlined"
          placeholder="Type a message..."
          sx={{
            borderRadius: "20px"
          }}
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
        <label
          htmlFor="file-input"
          style={{ marginLeft: "10px", cursor: "pointer" }}
        >
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
