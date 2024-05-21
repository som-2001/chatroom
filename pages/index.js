import {
  Box,
  Button,
  TextField,
  IconButton,
  InputAdornment,
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
      if (data.type === "image/jpeg") {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            images: decodedData,
            type: "jpeg",
            side: "left",
            bgcol: "transparent",
          },
        ]);
      } else if (data.type === "video/mp4") {
        setMessages((prevMessages) => [
          ...prevMessages,
          { images: decodedData, type: "mp4", side: "left", bgcol: "transparent" },
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
      { message: text, side: "right", bgcol: "rgb(176 183 193)" },
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
        console.log(encodedData);
        if (file.type === "image/jpeg") {
          setMessages((prevMessages) => [
            ...prevMessages,
            { images: `data:image/jpeg;base64,${encodedData}`, type: "jpeg", side: "right", bgcol: "transparent" },
          ]);
        } else if (file.type === "video/mp4") {
          setMessages((prevMessages) => [
            ...prevMessages,
            { images: `data:video/mp4;base64,${encodedData}`, type: "mp4", side: "right", bgcol: "transparent" },
          ]);
        }
        socket.emit("image-file", { Url: encodedData, type: file.type });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box>
      <h6
        id="header"
        className="text-center p-2 bg-purple-700 text-white"
        style={{
          clear: "both",
          fontSize: "1.2rem",
          fontFamily: "math",
          position: "fixed",
          width: "100vw",
          zIndex: "200",
        }}
      >
        Online Chat App
      </h6>

      <Box
        sx={{
          paddingBottom: "5%",
          position: "fixed",
          bottom: "0",
          width: "100vw",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <TextField
          type="text"
          onChange={(e) => setText(e.target.value)}
          inputRef={textRef}
          placeholder="Type a message..."
          sx={{
            maxWidth: { sm: "81vw", lg: "40vw", xs: "81vw", md: "70vw" },
            minWidth: { sm: "81vw", lg: "40vw", xs: "81vw", md: "70vw" },
            "& .MuiOutlinedInput-root": {
              borderRadius: "30px",
            },
          }}
          InputProps={{
            endAdornment: (
              <>
                <label component="label">
                  <IoIosLink
                    style={{
                      color: "white",
                      marginRight: "5px",
                      color: "grey",
                      cursor: "pointer",
                      fontSize: "1.5rem",
                    }}
                  />
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleChange}
                    style={{ display: "none" }}
                    required
                  />
                </label>
                <IoSend
                  onClick={onsubmit}
                  style={{
                    color: "white",
                    marginRight: "5px",
                    color: "grey",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                  }}
                />
              </>
            ),
          }}
        />
      </Box>

      <ReactScrollToBottom className="message-container">
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
              padding: "5px",
              maxWidth: "60%",
              alignSelf: data.side === "right" ? "flex-end" : "flex-start",
            }}
          >
            {data?.images ? (
              data.type === "jpeg" ? (
                <img
                  src={`data:image/jpeg;base64,${data.images}`}
                  alt=""
                  style={{ width: "300px", height: "auto" }}
                />
              ) : (
                <video controls style={{ width: "300px", height: "auto" }}>
                  <source src={`data:video/mp4;base64,${data.images}`} />
                </video>
              )
            ) : (
              <Typography variant="body2">
                {data?.message?.length > 70 ? (
                  <Box>
                    {
                      <p style={{ wordBreak: "break-all", fontWeight: 100 }}>
                        {data?.message?.slice(0, length)}...
                      </p>
                    }
                    <p
                      onClick={(e) => {
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
                      style={{
                        textDecoration: "underline",
                        wordBreak: "break-all",
                        fontWeight: 100,
                      }}
                    >
                      {data?.message}
                    </a>
                  </Box>
                ) : (
                  <Box>
                    <p style={{ wordBreak: "break-all", fontWeight: 100 }}>
                      {data?.message}
                    </p>
                  </Box>
                )}
              </Typography>
            )}
          </Box>
        ))}
      </ReactScrollToBottom>
    </Box>
  );
}
