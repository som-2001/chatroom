import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const [room, setRoom] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const router = useRouter();
  
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Box
        sx={{
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Join a Chat Room
        </Typography>
        <TextField
          type="text"
          label="Room name"
          placeholder="Select your Room name"
          required
          fullWidth
          margin="normal"
          variant="outlined"
          onChange={(e) => setRoom(e.target.value)}
        />
        <TextField
          type="text"
          label="User name"
          placeholder="Select your User name"
          required
          fullWidth
          margin="normal"
          variant="outlined"
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          type="text"
          label="Room Code"
          placeholder="Select your Room Code"
          required
          fullWidth
          margin="normal"
          variant="outlined"
          onChange={(e) => setCode(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: "1rem" }}
          onClick={() => {
            localStorage.setItem("room", room);
            localStorage.setItem("code", code);
            localStorage.setItem("name", name);
            router.push(`/chat/${code}`);
          }}
        >
          Create Room
        </Button>
      </Box>
    </Box>
  );
}
