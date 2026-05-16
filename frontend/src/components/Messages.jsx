import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Messages({ light }) {
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();
  const { userId: currentUserId } = useAuth();

  const bgMain = light
    ? "bg-gray-100 text-black"
    : "bg-neutral-950 text-white";

  const headerStyle = light
    ? "bg-white border-black/10 text-black"
    : "bg-neutral-900 border-white/10 text-white";

  const cardStyle = light
    ? "bg-white hover:bg-gray-100 border-black/10"
    : "bg-neutral-900 hover:bg-neutral-800 border-white/10";


  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/chat/my-chats",
          { withCredentials: true }
        );
        setMatches(res.data.matches);
      } catch (err) {
        // silent — chats may be empty
      }
    };

    fetchChats();
  }, []);

  const openChat = (match) => {
    const otherUser =
      match.user1Id._id === currentUserId
        ? match.user2Id
        : match.user1Id;

    navigate(`/chat/${match._id}`, {
      state: { otherUser },
    });
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${bgMain}`}>
      
      {/* HEADER */}
      <div className={`p-5 border-b font-semibold text-xl ${headerStyle}`}>
        Chats
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto">
        {matches.length === 0 && (
          <div className="flex items-center justify-center h-full opacity-60">
            No conversations yet.
          </div>
        )}

        {matches.map((match) => {
          const otherUser =
            match.user1Id._id === currentUserId
              ? match.user2Id
              : match.user1Id;

          return (
            <div
              key={match._id}
              onClick={() => openChat(match)}
              className={`p-4 border-b flex items-center gap-4 cursor-pointer transition-all duration-200 ${cardStyle}`}
            >
              <img
                src={otherUser.avatar}
                alt={otherUser.name}
                className="w-11 h-11 rounded-full object-cover"
              />

              <div className="flex-1">
                <div className="font-semibold tracking-tight">
                  {otherUser.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}