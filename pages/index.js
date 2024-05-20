import { Button, TextField } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
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
    socket.emit("someswar", text);
    textRef.current.value='';
    setMessages((prevMessages) => [...prevMessages, {"message":text,"side":"right","bgcol":"rgb(100 116 139)"}]);
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
    <div className="home">
      <div className="flex" style={{ position: "fixed", bottom: "5%",left:"15%" }}>
        <TextField 
        type="text" 
        onChange={(e) => setText(e.target.value)} 
        inputRef={textRef}
        placeholder="type message..."
        />
        <Button variant="contained" onClick={onsubmit}>submit</Button>
      </div>
      
      <div className="p-20">
        {messages &&
          messages?.map((data, index) => 
          <div key={index} style={{float:data.side,clear:"both",marginBottom:"20px",fontSize:"1.2rem",backgroundColor:data.bgcol,borderRadius:"15px"}} >
            <p className="p-2 ">{data.message}</p>
            </div>
        )}
      </div>
    </div>
  );
}
