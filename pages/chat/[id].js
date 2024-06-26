import { Box, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { IoSend } from "react-icons/io5";
import { IoIosLink } from "react-icons/io";
import ReactScrollToBottom from "react-scroll-to-bottom";
import { toast, Toaster } from "sonner";
import { RxCrossCircled } from "react-icons/rx";
import { CiMicrophoneOn } from "react-icons/ci";
import { Navbar } from "@/components/Navbar";
import { MdOutlineAutoDelete } from "react-icons/md";
// https://server-kpva.onrender.com
const socket = io("https://server-kpva.onrender.com");

export default function Chat() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const textRef = useRef();
  const [length, setLength] = useState(50);
  const [button, setButton] = useState("Read more");
  const [copy, setCopy] = useState("");
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [code, setCode] = useState("");
  const [copyName, setCopyName] = useState("");
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const [member, setMember] = useState([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [typingTimeoutRef, setTypingTimeoutRef] = useState("");
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {

    if(localStorage?.getItem('game')==='tictactoe'){
      window.location.reload();
      localStorage.removeItem('game');
    }
    const Storedname = localStorage?.getItem("name");
    const StoredRoomname = localStorage?.getItem("room");
    const Storedcode = localStorage?.getItem("code");

    setName(localStorage?.getItem("name"));
    setRoom(localStorage?.getItem("room"));
    setCode(localStorage?.getItem("code"));

    socket.emit("join_room", { Storedname, StoredRoomname, Storedcode });
  }, []);

  useEffect(() => {
    socket.emit("total_member", { name, room, code });
  }, [code]);

  useEffect(() => {
    const total_member = (data) => {
      console.log(data.members);
      setMember(data.members);
    };
    socket.on("total_member", total_member);

    return () => {
      socket.off("total_member", total_member);
    };
  }, []);

  function getCurrentTime() {
    const now = new Date(); // Get the current date and time
    const hours = now.getHours(); // Get the current hour
    const minutes = now.getMinutes(); // Get the current minute

    // Pad hours and minutes with leading zeros if needed
    const paddedHours = String(hours).padStart(2, "0");
    const paddedMinutes = String(minutes).padStart(2, "0");

    // Combine hours and minutes with a colon
    return `${paddedHours}:${paddedMinutes}`;
  }

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        const encodedData = encodeURIComponent(base64String);

        setMessages((prevMessages) => [
          ...prevMessages,
          {
            audio: base64String,
            type: "audio/wav",
            side: "right",
            bgcol: "transparent",
            name: name,
            room: room,
            code: code,
            getCurrentTime: getCurrentTime(),
          },
        ]);
        socket.emit("image-file", {
          Url: encodedData,
          type: "audio/wav",
          room,
          code,
          name,
          getCurrentTime: getCurrentTime(),
        });
      };
      reader.readAsDataURL(audioBlob);
      audioChunksRef.current = [];
    };

    mediaRecorderRef.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  useEffect(() => {
    const userJoined = (data) => {
      toast.info(data.message);
    };
    socket.on("userJoined", userJoined);
    return () => {
      socket.off("userJoined", userJoined);
    };
  }, []);

  useEffect(() => {
    const userleave = (data) => {
      toast.info(`${data.user} has left the room`);
      setMember(data.members);
    };

    socket.on("left_room", userleave);

    return () => {
      socket.off("left_room", userleave);
    };
  }, []);

  useEffect(() => {
    const message = (data) => {
      console.log(data);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          message: data.text,
          side: "left",
          bgcol: "#5D4EAC",
          copyMessage: data.copy,
          copyName: data.copyName,
          name: data.name,
          getCurrentTime: data.getCurrentTime,
        },
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

      console.log(data);
      if (data.type.startsWith("audio")) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            audio: decodedData,
            type: data.type,
            side: "left",
            bgcol: "transparent",
            name: data.name,
            getCurrentTime: data.getCurrentTime,
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
            name: data.name,
            getCurrentTime: data.getCurrentTime,
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
            name: data.name,
            getCurrentTime: data.getCurrentTime,
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
    socket.emit("someswar", {
      text,
      copy,
      room,
      code,
      name,
      copyName: copyName,
      getCurrentTime: getCurrentTime(),
    });

    textRef.current.value = "";
    textRef.current.focus();
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message: text,
        side: "right",
        bgcol: "#5970f9",
        copyMessage: copy,
        copyName: copyName,
        name: name,
        getCurrentTime: getCurrentTime(),
      },
    ]);
    setText("");
    setCopy("");
    setCopyName("");
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
              name: name,
              room: room,
              code: code,
              getCurrentTime: getCurrentTime(),
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
              name: name,
              room: room,
              code: code,
              getCurrentTime: getCurrentTime(),
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
              name: name,
              room: room,
              code: code,
              getCurrentTime: getCurrentTime(),
            },
          ]);
        }

        socket.emit("image-file", {
          Url: encodedData,
          type: file.type,
          room,
          code,
          name,
          getCurrentTime: getCurrentTime(),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDoubleClick = (message, name) => {
    setCopy(message);
    setCopyName(name);
    textRef.current.focus();
  };


  useEffect(() => {
    const deleteMessage = (data) => {
      setCopy("");
      setCopyName("");

      setMessages((prevMessages) =>
        prevMessages.filter((_, index) => index !== data.index)
      );
    };
    socket.on("deleteMessage", deleteMessage);
    return () => {
      socket.off("deleteMessage", deleteMessage);
    };
  }, []);

  const handleMessageChange = (e) => {
    setText(e.target.value);
    if (text === "") {
      socket.emit("stopTyping", {
        type: "stopTyping",
        name: name,
        room: room,
        code: code,
      });
    }
    if (text !== "") {
      socket.emit("typing", {
        type: "typing",
        name: name,
        room: room,
        code: code,
      });
    }

    clearTimeout(typingTimeoutRef);
    setTypingTimeoutRef(
      setTimeout(() => {
        socket.emit("stopTyping", {
          type: "stopTyping",
          name: name,
          room: room,
          code: code,
        });
      }, 1000)
    );
  };

  useEffect(() => {
    const Notificatio = (data) => {
      switch (data.type) {
        case "typing":
          setTypingUser(`${data.name} is typing`);
          break;
        default:
          break;
      }
    };
    socket.on("typing", Notificatio);
    return () => {
      socket.off("typing", Notificatio);
    };
  }, []);

  useEffect(() => {
    const stopTyping = (data) => {
      switch (data.type) {
        case "stopTyping":
          setTypingUser("Enter your message");
          break;
        default:
          break;
      }
    };
    socket.on("stopTyping", stopTyping);
    return () => {
      socket.off("stopTyping", stopTyping);
    };
  }, []);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        width: "100vw",
      }}
    >
      {<Navbar room={room} code={code} member={member} />}

      <Toaster position="top-center" autoClose={1000} />
      <ReactScrollToBottom className="message-container">
        {messages.map((data, index) => (
          <>
            <p
              style={{
                height: "auto",
                float: data.side,
                clear: "both",
                fontSize: "1rem",
                display: data.side === "right" ? "none" : "inherit",
                borderRadius: "10px",
                minWidth: "30%",
                wordBreak: "break-all",
                justifyItem: data.side === "right" ? "flex-end" : "flex-start",
              }}
            >
              {data?.name?.slice(0, 20)}
            </p>
            <Box
              key={index}
              sx={{
                height: "auto",
                float: data.side,
                clear: "both",
                marginTop: "5px",
                fontSize: "0.9rem",
                backgroundColor: data.bgcol,
                borderRadius: "10px",
                padding: "7px",
                minWidth: "20%",
                wordBreak: "break-all",
                justifyItem: data.side === "right" ? "flex-end" : "flex-start",
              }}
              onClick={() => handleDoubleClick(data.message, data.name)}
            >
              {data?.audio ? (
                <>
                  {/* <p>{data.name}</p> */}
                  <audio controls>
                    <source
                      src={`data:${data.type};base64,${data.audio}`}
                      type={data.type}
                    />
                    Your browser does not support the audio tag.
                  </audio>
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "6px",
                    }}
                  >
                    {data?.side === "right" ? (
                      <span
                        onClick={(e) => {
                          socket.emit("deleteMessage", {
                            message: data?.message,
                            room: room,
                            code: code,
                            name: name,
                            index: index,
                          });
                          
                        }}
                      >
                        {" "}
                        <MdOutlineAutoDelete
                          onClick={(e) => {
                            setCopy("");
                            setCopyName("");
                            textRef.current.focus();
                          }}
                        />
                      </span>
                    ) : null}
                    {data?.getCurrentTime}
                  </Box>
                </>
              ) : data?.images ? (
                <>
                  {/* <p>{data.name}</p> */}
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
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "6px",
                    }}
                  >
                    {data?.side === "right" ? (
                      <span
                        onClick={(e) => {
                          socket.emit("deleteMessage", {
                            message: data?.message,
                            room: room,
                            code: code,
                            name: name,
                            index: index,
                          });
                        }}
                      >
                        {" "}
                        <MdOutlineAutoDelete
                          onClick={(e) => {
                            setCopy("");
                            setCopyName("");
                            textRef.current.focus();
                          }}
                        />
                      </span>
                    ) : null}
                    {data?.getCurrentTime}
                  </Box>
                </>
              ) : data?.video ? (
                <>
                
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
                    <source
                      src={`data:video/mp4;base64,${data.video}`}
                    ></source>
                  </video>
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "6px",
                    }}
                  >
                    {data?.side === "right" ? (
                      <span
                        onClick={(e) => {
                          socket.emit("deleteMessage", {
                            message: data?.message,
                            room: room,
                            code: code,
                            name: name,
                            index: index,
                          });
                        }}
                      >
                        {" "}
                        <MdOutlineAutoDelete
                          style={{ color: "white" }}
                          onClick={(e) => {
                            setCopy("");
                            setCopyName("");
                            textRef.current.focus();
                          }}
                        />
                        {data?.getCurrentTime}
                      </span>
                    ) : null}
                    <p>{data?.getCurrentTime}</p>
                  </Box>
                </>
              ) : (
                <Box>
                  <Box style={{width:"100%"}}>
                    
                    <p
                      style={{
                        wordBreak: "break-all",
                        fontWeight: 100,
                        fontSize: "0.9rem",
                      }}
                    >
                      {data?.copyName?.slice(0, 20)}{" "}

                      {data?.copyMessage?.slice(0, 50)}
                    </p>
                    {data?.message?.length > 90 ? (
                      <Box>
                        <span
                          style={{
                            wordBreak: "break-all",
                            fontWeight: 100,
                            fontSize: "1.2rem",
                          }}
                          className="text-white"
                        >
                          {data?.message?.slice(0, length)}...
                        </span>

                        <span
                          onClick={() => {
                            setLength(data?.message?.length);
                            setButton("");
                          }}
                          className="text-white"
                        >
                          Read more
                        </span>

                        {!data.audio && !data.images && !data.video && data?.side === "right" ? (
                  <span style={{
              
                    fontSize: "0.9rem",
                    borderRadius: "10px",
                    position:"relative",
                    top:"0.8rem",
                    color:"white"
                   
                  }}
                    onClick={(e) => {
                      socket.emit("deleteMessage", {
                        message: data?.message,
                        room: room,
                        code: code,
                        name: name,
                        index: index,
                      });
                    }}
                  >
                    {" "}
                    <MdOutlineAutoDelete
                      style={{float: "right" }}
                      onClick={(e) => {
                        setCopy("");
                        setCopyName("");
                        textRef.current.focus();
                      }}
                    />
                  </span>
                ) : null}
                      </Box>
                    ) : data?.message?.startsWith("https://") ||
                      data?.message?.endsWith(".com") ? (
                      <Box>
                        <a
                          href={data?.message}
                          target="_blank"
                          rel="noreferrer"
                          className="cursor-pointer text-white"
                          style={{textDecoration:"underline"}}
                        >
                          {data?.message}
                        </a>
                        {!data.audio && !data.images && !data.video && data?.side === "right" ? (
                  <span style={{
              
                    fontSize: "0.9rem",
                    borderRadius: "10px",
                    position:"relative",
                    top:"0.8rem",
                    color:"white"
                   
                  }}
                    onClick={(e) => {
                      socket.emit("deleteMessage", {
                        message: data?.message,
                        room: room,
                        code: code,
                        name: name,
                        index: index,
                      });
                    }}
                  >
                    {" "}
                    <MdOutlineAutoDelete
                      style={{float: "right" }}
                      onClick={(e) => {
                        setCopy("");
                        setCopyName("");
                        textRef.current.focus();
                      }}
                    />
                  </span>
                ) : null}

                      </Box>
                    ) : (
                      <Box>
                        <span className="text-xl text-white">{data?.message}</span>
                        
                        {!data.audio && !data.images && !data.video && data?.side === "right" ? (
                  <span style={{
              
                    fontSize: "0.9rem",
                    borderRadius: "10px",
                    position:"relative",
                    top:"1rem",
                    color:"white"
                   
                  }}
                    onClick={(e) => {
                      socket.emit("deleteMessage", {
                        message: data?.message,
                        room: room,
                        code: code,
                        name: name,
                        index: index,
                      });
                    }}
                  >
                    {" "}
                    <MdOutlineAutoDelete
                      style={{float: "right" }}
                      onClick={(e) => {
                        setCopy("");
                        setCopyName("");
                        textRef.current.focus();
                      }}
                    />
                  </span>
                ) : null}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
            <Box >
      
              {!data.audio && !data.images && !data.video && (
                <p
                  style={{
                    height: "auto",
                    float: data.side,
                    clear:"both",
                    fontSize: "0.9rem",
                    borderRadius: "10px",
                    wordBreak: "break-all",
                    
                   
                  }}
                >
                  {data?.getCurrentTime}
                
                </p>
              )}
              
            </Box>
          </>
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
          marginTop: "10px",

        }}
      >
        <TextField
          id="outlined-basic"
          label={typingUser}
          variant="outlined"
          placeholder={recording ? "Recording..." : "Type a message..."}
          fullWidth
          sx={{
            borderRadius: "30px",
          }}
          inputRef={textRef}
          disabled={recording}
          onChange={handleMessageChange}
          onKeyDown={(e) => e.key === "Enter" && onsubmit()}
          InputProps={{
            startAdornment: (
              <>
                {copy && (
                  <>
                    <RxCrossCircled
                      onClick={(e) => {
                        setCopy("");
                        setCopyName("");
                        textRef.current.focus();
                      }}
                    />
                    <p style={{ width: "133px", cursor: "pointer" }}>
                      <b>{copy.slice(0, 10)}:</b>{" "}
                    </p>
                  </>
                )}
              </>
            ),
          }}
        />
        <button
          onClick={recording ? stopRecording : startRecording}
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
          {recording ? <IoSend /> : <CiMicrophoneOn />}
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
