import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

export default function Message() {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  const socketRef = useRef(null);

  // 🔥 Connect Socket
  useEffect(() => {
    socketRef.current = io("http://localhost:3000", {
      withCredentials: true,
    });

    socketRef.current.emit("joinRoom", matchId);

    socketRef.current.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [matchId]);

  // 🔥 Fetch old messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/chat/${matchId}`,
          { withCredentials: true }
        );
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [matchId]);

  // 🔥 Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 Send Message
  const sendMessage = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        "http://localhost:3000/api/chat/send",
        { matchId, text },
        { withCredentials: true }
      );

      socketRef.current.emit("sendMessage", res.data);

      setMessages((prev) => [...prev, res.data]);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  const currentUserId = localStorage.getItem("userId");

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      
      {/* Header */}
      <div className="p-4 bg-white shadow font-semibold text-lg">
        DevSwipe Chat
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentUserId;

          return (
            <div
              key={msg._id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs text-white ${
                  isOwn ? "bg-pink-500" : "bg-gray-400"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-full px-4 py-2 outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-pink-500 text-white px-5 rounded-full"
        >
          Send
        </button>
      </div>
    </div>
  );
}