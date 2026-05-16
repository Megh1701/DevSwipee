import React, { act, use, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Wrench } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import socket from "../socket/socket";
import { Link } from "react-router-dom";
import { set } from "zod";
import { useAuth } from "@/context/AuthContext";

export default function PremiumChatRoom({ light }) {
  const { matchId } = useParams();
  const { userId } = useAuth();

  const [currentUserId, setCurrentUserId] = useState(null);
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
  const [showEndSessionModal, setShowEndSessionModal] = useState(false);  useEffect(() => {
    setCurrentUserId(userId);
  }, [userId]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/session/getsession?matchId=${matchId}`,
          { withCredentials: true }
        );

        setActiveSession(res.data.session);
      } catch (err) {
        // silent — session may not exist yet
      }
    };

    getSession();
  }, [matchId]);

  useEffect(() => {
    if (!currentUserId) return;

    socket.emit("joinUserRoom", currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    socket.on("newInvite", (newInvite) => {
      setIsInvite((prev) => [...prev, newInvite])
    });

    const handleSessionEnded = (endedSessionId) => {
      setActiveSession((prev) => (prev && prev._id === endedSessionId ? null : prev));
    };
    socket.on("sessionEnded", handleSessionEnded);

    return () => {
      socket.off("newInvite");
      socket.off("sessionEnded", handleSessionEnded);
    };
  }, [])

  useEffect(() => {
    const fetchPendingInvites = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/session/pending",
          { withCredentials: true }
        );

        setIsInvite(res.data.invites); 
      } catch (err) {
        // silent — no pending invites
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
        toast.error("Failed to load chat info");
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
    const handleTyping = (senderId) => {
      if (senderId !== currentUserId) setIsTyping(true);
    };

    const handleStopTyping = (senderId) => {
      if (senderId !== currentUserId) setIsTyping(false);
    };



    socket.on("receiveMessage", handleMessage);
    socket.on("userTyping", handleTyping);
    socket.on("userStoppedTyping", handleStopTyping);

    return () => {
      socket.off("receiveMessage", handleMessage);
      socket.off("userTyping", handleTyping);
      socket.off("userStoppedTyping", handleStopTyping);
    };
  }, [matchId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/chat/${matchId}/messages`,
          { withCredentials: true }
        );
        setMessages(res.data?.messages || []);
      } catch (err) {
        toast.error("Failed to load messages");
      }
    };

    if (matchId) fetchMessages();
  }, [matchId]);

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


  const handleSendMessage = () => {
    if (!inputValue.trim() || !otherUserId) return;

    socket.emit("sendMessage", {
      matchId,
      senderId: currentUserId,
      receiverId: otherUserId,
      content: inputValue,
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


      setIsBuild(false);
      setProjectName("");
      setProjectType("");
      toast.success("Session invite sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send invite");
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

      setIsInvite((prev) =>
        prev.filter((i) => i._id !== inviteId)
      );
      if (res.data.session) {
        setActiveSession(res.data.session);
      }
      toast.success("Invite accepted!");
    } catch (err) {
      toast.error("Failed to accept invite");
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
      toast.success("Invite declined");
    } catch (err) {
      toast.error("Failed to decline invite");
    }
  };
  const bgMain = light
    ? "bg-gray-100 text-black"
    : "bg-neutral-950 text-white";

  const receivedBubble = light
    ? "bg-white border border-black/10 text-black shadow"
    : "bg-white/10 border border-white/10";

  const ownBubble =
    "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white";

  const handleProjectname = (e) => {
    setProjectName(e.target.value)
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
            const senderId =
              typeof msg.senderId === "object"
                ? msg.senderId._id
                : msg.senderId;

            const isOwn = senderId === currentUserId;

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
          <motion.span className={`inline-flex px-4 py-3 rounded-2xl border-emaral-200  gap-2 bg-white/10 border border-white/10 text-black shadow}`}>
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                className="h-1.5 w-1.5 rounded-full  bg-emerald-500 text-white"
                animate={{
                  y: [0, -6, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: dot * 0.2,
                }}
              />
            ))}
          </motion.span>
        )}

        <div ref={messagesEndRef} />
      </div>
      {activeSession && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all
      ${light
              ? "bg-green-100 border-green-300 text-black"
              : "bg-emerald-500/10 border-emerald-500/20 text-white"
            }`}>
          <Link
            to={`/session/${activeSession._id}`}
            className="flex-1 flex items-center justify-between group hover:opacity-80 transition"
          >
            {/* Left */}
            <div className="flex items-center gap-3">
              <span className="text-lg">🚀</span>

              <div>
                <p className="text-sm font-medium">
                  You both started:{" "}
                  <span className="font-semibold">
                    {activeSession.projectName}
                  </span>
                </p>

                <p className="text-xs opacity-70">
                  Click to open Kanban board
                </p>
              </div>
            </div>
          </Link>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              setShowEndSessionModal(true);
            }}
            className={`p-2 rounded-lg transition ${light ? "text-red-500 hover:bg-red-200" : "text-red-400 hover:bg-red-500/20"}`}
            title="End Session"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>
      )}

      {/* END SESSION MODAL */}
      <AnimatePresence>
        {showEndSessionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 250, damping: 25 }}
              className={`w-full max-w-sm rounded-2xl p-6 shadow-2xl border ${
                light ? "bg-white border-gray-200 text-black" : "bg-zinc-900 border-zinc-800 text-white"
              }`}
            >
              <h3 className="text-xl font-bold mb-2">End Session?</h3>
              <p className={`text-sm mb-6 ${light ? "text-gray-600" : "text-zinc-400"}`}>
                Are you sure you want to end this collaboration session? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndSessionModal(false)}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition ${
                    light ? "bg-gray-100 hover:bg-gray-200 text-black" : "bg-zinc-800 hover:bg-zinc-700 text-white"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await axios.put(`http://localhost:3000/api/session/${activeSession._id}/end`, {}, { withCredentials: true });
                      setActiveSession(null);
                      setShowEndSessionModal(false);
                      toast.success("Session ended successfully");
                    } catch (err) {
                      toast.error("Failed to end session");
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white transition"
                >
                  Yes, End it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INPUT */}
      <div className="p-4 border-t flex gap-3">

        {/* TRIGGER */}
        <button
          onClick={() => !activeSession && setIsBuild(true)}
          disabled={!!activeSession}
          className={`flex items-center gap-2 border rounded-md p-2 transition
    ${activeSession
              ? "opacity-50 cursor-not-allowed bg-gray-400 text-white"
              : light
                ? "bg-white text-black border-gray-300 hover:bg-gray-50 cursor-pointer"
                : "bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800 cursor-pointer"
            }
  `}
        >
          <Wrench />
          <span>
            {activeSession ? "Session Actived" : "Build Together"}
          </span>
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
                    <option value="">Choose Assignment Policy</option>
                    <option value="OWNER_ONLY">Only owner assigns tasks</option>
                    <option value="ANYONE">Anyone can assign tasks</option>
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