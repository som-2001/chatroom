import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Toaster, toast } from "sonner";

// Define the validation schema
const schema = yup.object().shape({
  room: yup.string().required("Room name is required"),
  name: yup.string().required("User name is required"),
  code: yup
    .string()
    .required("Room Code is required")
    .min(12, "Room Code must be at least 12 characters")
    .matches(/[A-Za-z]/, "Room Code must contain at least one letter")
    .matches(/\d/, "Room Code must contain at least one number")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Room Code must contain at least one special character"
    )
  
});

export default function Home() {
  const router = useRouter();
  const [action, setAction] = useState(""); // State to track the action

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const string = "1234567890-+qwertyuiopasdfghjkl;123654789/*`";

  const generatePasskey = () => {
    let passkey = "";
    for (let i = 0; i < 20; i++) {
      passkey += string.charAt(Math.floor(Math.random() * string.length));
    }
    return passkey;
  };


  const joinRoom = (data) => {
    localStorage.setItem("room", data.room);
    localStorage.setItem("code", data.code);
    localStorage.setItem("name", data.name);
    router.push(`/chat/${124}`);
  };

  const createRoom = (data) => {
    const passkey = generatePasskey();
    localStorage.setItem("room", data.room);
    localStorage.setItem("code", `${data.code}+${passkey}`);
    localStorage.setItem("name", data.name);
    router.push(`/chat/${124}`);
  };

  const onSubmit = (data) => {
    if (action === "join") {
      joinRoom(data);
    } else if (action === "create") {
      createRoom(data);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f2f5",
      }}
      className="bg-center"
    >
      <Toaster position="top-center" autoClose={3000} />
      <Box
        sx={{
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          backgroundColor: "white",
          textAlign: "center",
          borderRadius: "20px",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Join a Chat Room
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="room"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                label="Room name*"
                placeholder="Select your Room name"
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!errors.room}
                helperText={errors.room ? errors.room.message : ""}
              />
            )}
          />
          <Controller
            name="name"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                label="User name*"
                placeholder="Select your User name"
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name ? errors.name.message : ""}
              />
            )}
          />
          <Controller
            name="code"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                {...field}
                type="text"
                label="Room Code*"
                placeholder="Select your Room Code"
                fullWidth
                margin="normal"
                variant="outlined"
                error={!!errors.code}
                helperText={errors.code ? errors.code.message : ""}
              />
            )}
          />
        
          <Box
            sx={{
              display: "flex",
              gap: "15px",
              marginTop: "1rem",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => setAction("join")}
              type="submit"
            >
              Join Room
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setAction("create")}
              type="submit"
            >
              Create Room
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
