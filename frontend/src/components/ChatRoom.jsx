import React, { use, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Wrench } from "lucide-react";
import axios from "axios";
import socket from "../socket/socket";
import { set } from "zod";

export default function PremiumChatRoom({ light }) {
  const { matchId } = useParams();
  const currentUserId = localStorage.getItem("userId");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isBuild, setIsBuild] = useState(false)
  const [otherUser, setOtherUser] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const [isInvite, setIsInvite] = useState([])
  const [projectName, setProjectName] = useState("")
  const [projectType, setProjectType] = useState("");
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [session, setSession] = useState([])
  const [activeSession, setActiveSession] = useState(null);

  useEffect(() => {
    socket.on("sessionCreated", (session) => {
      setActiveSession(session);  // 🔥 THIS triggers UI update
    });

    return () => socket.off("sessionCreated");
  }, []);


  useEffect(() => {
    if (!currentUserId) return;

    socket.emit("joinUserRoom", currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    socket.on("newInvite", (newInvite) => {
      console.log(newInvite)

      setIsInvite((prev) => [...prev, newInvite])

    })
    return () => {
      socket.off("newInvite");
    };
  }, [])

  /* ---------------- FETCH MATCH META ---------------- */

  useEffect(() => {
    const fetchPendingInvites = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/session/pending",
          { withCredentials: true }
        );

        setIsInvite(res.data.invites); // 🔥 this fills pending invites
      } catch (err) {
        console.log(err.response?.data);
      }
    };

    fetchPendingInvites();
  }, []);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/chat/${matchId}/meta`,
          { withCredentials: true }
        );

        const match = res.data?.match;
        if (!match) return;

        const isUser1 =
          match.user1Id._id.toString() === currentUserId;

        const other = isUser1 ? match.user2Id : match.user1Id;

        setOtherUser(other);
        setOtherUserId(other._id);
      } catch (err) {
        console.error("Meta fetch failed", err);
      }
    };

    if (matchId) fetchMeta();
  }, [matchId, currentUserId]);

  /* ---------------- SOCKET JOIN ---------------- */

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
        setMessages(res.data?.messages || []);
      } catch (err) {
        console.error("Message fetch failed", err);
      }
    };

    if (matchId) fetchMessages();
  }, [matchId]);

  /* ---------------- AUTO SCROLL ---------------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const isAwayFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight > 100;

    setHasScrolled(isAwayFromBottom);
  };

  /* ---------------- TYPING ---------------- */

  const handleTypingChange = (value) => {
    setInputValue(value);

    socket.emit("typing", {
      matchId,
      senderId: currentUserId,
    });

    if (typingTimeoutRef.current)
      clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        matchId,
        senderId: currentUserId,
      });
    }, 1000);
  };

  /* ---------------- SEND MESSAGE ---------------- */

  const handleSendMessage = () => {
    if (!inputValue.trim() || !otherUserId) return;

    const tempMessage = {
      _id: Date.now(),
      senderId: currentUserId,
      content: inputValue,
    };

    setMessages((prev) => [...prev, tempMessage]);

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


  /* ---------------- SAFE LOADING ---------------- */

  if (!otherUser) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading Chat...
      </div>
    );
  }

  const handleCreateSession = async () => {
    if (!projectName.trim() || !projectType) return;
    try {
      const res = await axios.post(
        "http://localhost:3000/api/session/invite",
        {
          projectName,
          assignmentMode: projectType,
          matchId,
        },
        { withCredentials: true }
      );

      console.log(res.data);

      setIsBuild(false);
      setProjectName("");
      setProjectType("");
    } catch (err) {
      console.log(err.response?.data);
    }
  };



  const acceptInvite = async (inviteId) => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/session/respond",
        {
          inviteId,
          status: "ACCEPTED",
        },
        { withCredentials: true }
      );

      console.log(res.data);

      // optional: remove invite from UI
      setIsInvite((prev) =>
        prev.filter((i) => i._id !== inviteId)
      );
    } catch (err) {
      console.error(err);
    }
  };
  const rejectInvite = async (inviteId) => {
    try {
      await axios.post(
        "http://localhost:3000/api/session/respond",
        { inviteId, status: "REJECTED" },
        { withCredentials: true }
      );

      setIsInvite((prev) =>
        prev.filter((i) => i._id !== inviteId)
      );
    } catch (err) {
      console.error(err);
    }
  };
  /* ---------------- UI THEME ---------------- */

  const bgMain = light
    ? "bg-gray-100 text-black"
    : "bg-neutral-950 text-white";

  const receivedBubble = light
    ? "bg-white border border-black/10 text-black shadow"
    : "bg-white/10 border border-white/10";

  const ownBubble =
    "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white";

  /* ---------------- RENDER ---------------- */

  const handleProjectname = (e) => {
    setProjectName(e.target.value)
    console.log(projectName)
  }
  const InvitePopup = ({ invite }) => (
    <motion.div
      initial={{ opacity: 0, y: -40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-[320px] bg-white text-black rounded-2xl shadow-2xl border p-4 flex flex-col gap-3"
    >
      {/* HEADER */}
      <div>
        <p className="text-sm font-semibold">
          Collaboration Invite
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {otherUser?.name} invited you to collaborate
        </p>
      </div>

      {/* PROJECT CARD */}
      <div className="bg-gray-50 rounded-xl p-3 border">
        <p className="text-xs text-gray-500">Project</p>
        <p className="text-sm font-medium">
          {invite.projectName}
        </p>

        <p className="text-xs text-gray-500 mt-2">Access</p>
        <p className="text-xs font-medium">
          {invite.assignmentMode.replace("_", " ")}
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex gap-2 mt-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => acceptInvite(invite._id)}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium transition"
        >
          Accept
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => rejectInvite(invite._id)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium transition"
        >
          Decline
        </motion.button>
      </div>

      {/* FOOTER */}
      <p className="text-[11px] text-gray-400 text-center mt-1">
        You can respond later from notifications
      </p>
    </motion.div>
  );
  return (
    <div className={`flex flex-col h-screen ${bgMain}`}>
      {/* HEADER */}
      <div className="px-6 py-4 border-b">
        <h1 className="text-xl font-semibold">
          {otherUser.name}
        </h1>
      </div>

      {/* MESSAGES */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        <AnimatePresence>
          {messages.map((msg) => {
            const isOwn =
              msg.senderId === currentUserId ||
              msg.senderId?._id === currentUserId;

            return (
              <motion.div
                key={msg._id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl max-w-xs ${isOwn ? ownBubble : receivedBubble
                    }`}
                >
                  {msg.content}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <div className="text-sm opacity-70">
            typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
      {activeSession && (
        <div
          className="p-3 bg-green-100 border rounded cursor-pointer"
          onClick={() => navigate(`/session/${activeSession._id}`)}
        >
          🚀 You both started: {activeSession.projectName}
        </div>
      )}

      {/* INPUT */}
      <div className="p-4 border-t flex gap-3">

        {/* TRIGGER */}
        <button
          onClick={() => setIsBuild(true)}
          className={`flex items-center gap-2 cursor-pointer border rounded-md p-2
    ${light ? "bg-white text-black border-gray-300 hover:bg-gray-50"
              : "bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800"}
  `}
        >
          <Wrench />
          <span>Build Together</span>
        </button>

        {/* OVERLAY + PANEL */}
        <AnimatePresence>
          {isBuild && (
            <>
              {/* BACKDROP */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsBuild(false)}
                className="fixed inset-0 z-40 bg-black/40"
              />

              {/* SIDE PANEL */}
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
                className={`fixed right-0 top-0 h-full w-[380px] z-50 p-5 flex flex-col gap-4 border-l
          ${light
                    ? "bg-white text-black border-gray-200"
                    : "bg-zinc-950 text-white border-zinc-800"}
        `}
              >
                {/* HEADER */}
                <div>
                  <h2 className="text-lg font-semibold">
                    Create Collaboration Session
                  </h2>
                  <p className="text-sm opacity-70">
                    Build Together
                  </p>
                </div>

                {/* FORM */}
                <div className="flex flex-col gap-3 mt-4">
                  <label className="text-xs opacity-60" >
                    Project Name
                  </label>

                  <input
                    type="text"
                    placeholder="My Awesome Project"
                    onChange={handleProjectname}
                    className={`px-3 py-2 rounded-md border outline-none
              ${light
                        ? "bg-gray-50 border-gray-300 text-black focus:bg-white"
                        : "bg-zinc-900 border-zinc-700 text-white focus:bg-zinc-800"}
            `}
                  />

                  <label className="text-xs opacity-60 mt-2">
                    Task Assignment Policy
                  </label>

                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className={`px-3 py-2 rounded-md border
    ${light
                        ? "bg-gray-50 border-gray-300 text-black"
                        : "bg-zinc-900 border-zinc-700 text-white"}
  `}
                  >
                    <option value="ANYONE">Anyone can assign tasks</option>
                    <option value="OWNER_ONLY">Only owner assigns tasks</option>
                    <option value="SELF_ONLY">Self-assign only</option>
                  </select>
                </div>

                {/* ACTION */}
                <button
                  onClick={handleCreateSession}
                  className={`mt-auto py-2 rounded-md font-medium transition
            ${light
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-white text-black hover:bg-gray-200"}
          `}
                >
                  Create Session
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <input
          value={inputValue}
          onChange={(e) =>
            handleTypingChange(e.target.value)
          }
          onKeyDown={handleKeyDown}
          className="flex-1 border px-4 py-2 rounded-xl"
          placeholder="Type message..."
        />

        <button
          onClick={handleSendMessage}
          className="px-4 py-2 bg-emerald-500 text-white rounded-xl"
        >
          <Send size={18} />
        </button>
      </div>
      <div className="fixed top-4 right-4 space-y-3 z-50">
        <AnimatePresence>
          {isInvite.map((invite) => (
            <InvitePopup key={invite._id} invite={invite} />
          ))}
        </AnimatePresence>
      </div>
    </div>


  );
}