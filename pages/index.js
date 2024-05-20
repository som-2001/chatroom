import { Box, Button, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import ReactScrollToBottom from 'react-scroll-to-bottom';
const socket = io("https://server-kpva.onrender.com");


export default function Home() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const textRef=useRef();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected");
    });
  }, []);

  const onsubmit = () => {
    if(text.length===0) return ;
    socket.emit("someswar", text);
    textRef.current.value='';
    setMessages((prevMessages) => [...prevMessages, {"message":text,"side":"right","bgcol":"rgb(100 116 139)"}]);
    setText('');
  };

  useEffect(() => {
    const message = (data) => {
    
      setMessages((prevMessages) => [...prevMessages, {"message":data,"side":"left","bgcol":"whitesmoke"}]);
    };
    socket.on("message", message);

    return () => {
      socket.off("message", message);
    };
  }, []);

  return (
    <Box className="home">
      <div className="flex" style={{ position: "fixed", bottom: "5%",left:"15%" }}>
        <TextField 
        type="text" 
        onChange={(e) => setText(e.target.value)} 
        inputRef={textRef}
        placeholder="type message..."
        />
        <Button variant="contained" onClick={onsubmit}>submit</Button>
      </div>
      
      <Box className="p-10" sx={{width:"100vw",height:{lg:"60vh",xs:"80vh"},overflowY:'scroll'}}>
      
        {messages &&
          messages?.map((data, index) => 
            <ReactScrollToBottom style={{height:"40px"}}>
          <div key={index} style={{float:data.side,clear:"both",marginBottom:"20px",fontSize:"1.2rem",backgroundColor:data.bgcol,borderRadius:"15px"}} >
            <p className="p-2 ">{data.message}</p>
            </div>
            </ReactScrollToBottom>
        )}
        
      </Box>
    </Box>
  );
}
