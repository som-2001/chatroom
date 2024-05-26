import { Navbar } from "@/components/Navbar";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { Toaster, toast } from "sonner";

const socket = io("https://server-kpva.onrender.com");

export default function TicTacToe() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState("");
  const [text, setText] = useState("");
  const textRef = useRef(null);
  const [currentTurn, setCurrentTurn] = useState();

  useEffect(() => {
    const Storedname = localStorage?.getItem("name");
    const StoredRoomname = localStorage?.getItem("room");
    const Storedcode = localStorage?.getItem("code");
    const StoredId = localStorage?.getItem("userId");

    setName(Storedname);
    setRoom(StoredRoomname);
    setCode(Storedcode);
    setUserId(StoredId);

    localStorage.setItem("game", "tictactoe");

    socket.emit("join_room", { Storedname, StoredRoomname, Storedcode });
  }, []);

  useEffect(() => {
    const userJoined = (data) => {
      localStorage.setItem("userId", data.id);
      setUserId(data.id);
    };

    socket.on("userJoined", userJoined);

    return () => {
      socket.off("userJoined", userJoined);
    };
  }, []);

  const winPatterns = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [3, 4, 5],
    [6, 7, 8],
  ];

  function checkWinner() {
    const boxes = document.querySelectorAll(".box");
    for (let pattern of winPatterns) {
      const [a, b, c] = pattern;
      const boxA = boxes[a].innerText;
      const boxB = boxes[b].innerText;
      const boxC = boxes[c].innerText;

      if (boxA && boxA === boxB && boxA === boxC) {
        return boxA;
      }
    }
    return null;
  }
  const handleClick = (id) => {
    if (currentTurn !== userId) {
      socket.emit("clicked", { id, name, room, code, userId });
     
    } else {
      toast("Not your turn!");
    }
  };
   
 
  useEffect(() => {
    const clicked = (data) => {
      const button = document.getElementById(data.data.id);
      setCurrentTurn(data.data.userId);
      if (button) {
        button.disabled = true;
        button.innerText = data.Symbol;
      }
     const winner= checkWinner();
     if(winner){
      toast(`Winner is ${winner}`);
      const boxes = document.querySelectorAll(".box");
      for(let i of boxes)
        {
          i.innerText='';
        }
      }
    };

    socket.on("clicked", clicked);

    return () => {
      socket.off("clicked", clicked);
    };
  }, []);

  useEffect(() => {
    const message = (data) => {
      toast(`${data.name}: ${data.text}`);
    };

    socket.on("message", message);

    return () => {
      socket.off("message", message);
    };
  }, []);

  const handleSubmit = (e) => {
    socket.emit("someswar", { text, name, room, code });
    textRef.current.value = "";
    textRef.current.focus();
  };

  return (
    <Box sx={{ textAlign: "center", p: 4, backgroundImage:'url(https://imgs.search.brave.com/9vqWNmOgc9y5v_VA7eYYx9XwWpXL_fecLMkfx52UXaQ/rs:fit:860:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJjYXZlLmNv/bS93cC93cDg5ODQ3/MzYuanBn)',
      height:"100vh",
      backgroundRepeat:"no-repeat",
      backgroundSize:"cover",
      
     }}>
      <Typography variant="h4" className="text-center p-3 mt-10 mb-16 text-3xl">
        Tic Tac Toe
      </Typography>

      <Toaster autoClose={1000} position="top-right" />

      <Box className="text-center">
        <Box className="p-2" sx={{ display: "flex", justifyContent: "center"}}>
          {[0, 1, 2].map((id) => (
            <Button
              key={id}
              variant="outlined"
              className="box p-10"
              id={id.toString()}
              onClick={() => handleClick(id)}
              sx={{
                width: "80px",
                height: "80px",
                margin: "5px",
                fontSize: "24px",
                backgroundColor:"white"
              }}
            ></Button>
          ))}
        </Box>
        <Box className="p-2" sx={{ display: "flex", justifyContent: "center" }}>
          {[3, 4, 5].map((id) => (
            <Button
              key={id}
              variant="outlined"
              className="box p-10"
              id={id.toString()}
              onClick={() => handleClick(id)}
              sx={{
                width: "80px",
                height: "80px",
                margin: "5px",
                fontSize: "24px",
                backgroundColor:"white"
              }}
            ></Button>
          ))}
        </Box>
        <Box className="p-2" sx={{ display: "flex", justifyContent: "center" }}>
          {[6, 7, 8].map((id) => (
            <Button
              key={id}
              variant="outlined"
              className="box p-10"
              id={id.toString()}
              onClick={() => handleClick(id)}
              sx={{
                width: "80px",
                height: "80px",
                margin: "5px",
                fontSize: "24px",
                backgroundColor:"white"
              }}
            ></Button>
          ))}
        </Box>
      </Box>
      <Box
        className="mt-5"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
        }}
      >
        <TextField
          type="text"
          inputRef={textRef}
          placeholder="Type your message..."
          onChange={(e) => setText(e.target.value)}
          
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          sx={{ marginRight: "10px",
          backgroundColor:"white",
          borderRadius:"5px"
           }}
        />
      </Box>
    </Box>
  );
}
