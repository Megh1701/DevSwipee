import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import axios from "axios";
import socket from "../socket/socket";
import { useLocation } from "react-router-dom";

export default function PremiumChatRoom({ light }) {
  const { matchId } = useParams();

  const currentUserId = localStorage.getItem("userId");
  const otherUserId = localStorage.getItem("otherUserId");
  const location = useLocation();
  const otherUser = location.state?.otherUser;
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ---------------- THEME ---------------- */

  const bgMain = light ? "bg-gray-100 text-black" : "bg-neutral-950 text-white";
  const headerBg = light
    ? "bg-white text-black border-black/10"
    : "bg-neutral-900/60 text-white border-white/5 backdrop-blur-lg";
  const inputBg = light
    ? "bg-white border-black/10 text-black"
    : "bg-neutral-800/50 border-white/10 text-white";
  const receivedBubble = light
    ? "bg-white border border-black/10 text-black shadow"
    : "bg-white/10 backdrop-blur-md border border-white/10 text-neutral-50 shadow-lg shadow-black/20";
  const ownBubble =
    "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20";

  /* ---------------- SOCKET ---------------- */

  useEffect(() => {
    if (!matchId) return;

    socket.emit("joinRoom", matchId);

    const handleMessage = (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    };

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on("receiveMessage", handleMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);

    return () => {
      socket.off("receiveMessage", handleMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStopTyping);
    };
  }, [matchId]);

  /* ---------------- FETCH OLD MESSAGES ---------------- */

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/chat/${matchId}/messages`,
          { withCredentials: true }
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };

    if (matchId) fetchMessages();
  }, [matchId]);

  /* ---------------- AUTO SCROLL ---------------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    setHasScrolled(scrollHeight - scrollTop - clientHeight > 100);
  };

  /* ---------------- TYPING LOGIC ---------------- */

  const handleTypingChange = (value) => {
    setInputValue(value);

    socket.emit("typing", {
      matchId,
      senderId: currentUserId,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        matchId,
        senderId: currentUserId,
      });
    }, 1000);
  };

  /* ---------------- SEND MESSAGE ---------------- */

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    socket.emit("sendMessage", {
      matchId,
      senderId: currentUserId,
      receiverId: otherUserId,
      content: inputValue,
    });

    socket.emit("stopTyping", {
      matchId,
      senderId: currentUserId,
    });

    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className={`flex flex-col h-screen ${bgMain}`}>
      {/* HEADER */}
      <motion.div
        className={`px-6 py-4 border-b ${hasScrolled ? "shadow-lg" : ""
          } ${headerBg}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-semibold">
            {otherUser?.name || "Chat"}
          </h1>
          <p className="text-sm text-emerald-400/70">Online</p>
        </div>
      </motion.div>

      {/* MESSAGES */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        <div className="max-w-4xl mx-auto w-full space-y-4">
          <AnimatePresence>
            {messages.map((msg) => {
              const isOwn =
                msg.senderId === currentUserId ||
                msg.senderId?._id === currentUserId;

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"
                    }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`px-4 py-3 rounded-2xl max-w-xs lg:max-w-md text-sm ${isOwn
                        ? `${ownBubble} rounded-br-sm`
                        : `${receivedBubble} rounded-bl-sm`
                      }`}
                  >
                    {msg.content}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* TYPING INDICATOR */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="flex justify-start"
              >
                <div
                  className={`${receivedBubble} px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center`}
                >
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="w-2 h-2 bg-emerald-400 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: dot * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* INPUT */}
      <motion.div
        className={`px-6 py-4 border-t ${light
            ? "bg-white border-black/10"
            : "bg-neutral-900/60 border-white/5 backdrop-blur-lg"
          }`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-4xl mx-auto flex gap-3">
          <motion.input
            type="text"
            value={inputValue}
            onChange={(e) => handleTypingChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            whileFocus={{ scale: 1.02 }}
            className={`flex-1 px-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${inputBg}`}
          />

          <motion.button
            onClick={handleSendMessage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={!inputValue.trim()}
            className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl text-white disabled:opacity-50 flex items-center"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}