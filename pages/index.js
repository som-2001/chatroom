import {
  Box,
  Button,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { IoSend } from "react-icons/io5";
import ReactScrollToBottom from "react-scroll-to-bottom";

const socket = io("https://server-kpva.onrender.com");

export default function Home() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const textRef = useRef();

  useEffect(() => {
    const handleUserJoined = (data) => {
      console.log(data);
      alert(data.message);
    };

    socket.on("userJoined", handleUserJoined);

    // Cleanup the event listener on component unmount
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

  return (
    <Box >
      <h6
        className="text-center p-2 bg-purple-700 text-white"
        style={{ clear: "both", fontSize: "1.2rem", fontFamily: "math" }}
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
              <IoSend
                onClick={onsubmit}
                style={{
                  color: "white",
                  marginRight: "5px",
                  color: "blue",
                  cursor: "pointer",
                  fontSize: "1.5rem",
                }}
              />
            ),
          }}
        />
      </Box>

    
         <ReactScrollToBottom className="message-container">
          {messages.map((data, index) => (
            <Box
              key={index}
              sx={{
                height: "fit-content",
                float: data.side,
                clear: "both",
                marginBottom: "20px",
                fontSize: "1.2rem",
                backgroundColor: data.bgcol,
                borderRadius: "15px",
                padding: "10px",
                maxWidth: "60%",
                alignSelf: data.side === "right" ? "flex-end" : "flex-start",
              }}
            >
              {data.message}
            </Box>
          ))}
        </ReactScrollToBottom>

    </Box>
  );
}
