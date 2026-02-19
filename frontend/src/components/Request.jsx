import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Check, X, Sparkles } from "lucide-react";
import api from "@/lib/axios";

const Request = ({ light }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterModel, setFilterModel] = useState(false);
  const [current, setCurrent] = useState(null);
  const [activeFilter, setActiveFilter] = useState("newest");
  const [page, setPage] = useState(0);
  const itemsPerPage = 5;

  // ---------- FILTERED REQUESTS ----------
  const filteredRequests = useMemo(() => {
    if (activeFilter === "newest") {
      return [...requests].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    if (activeFilter === "oldest") {
      return [...requests].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    }
    return requests.filter((swipe) => swipe.status === activeFilter);
  }, [requests, activeFilter]);

  // ---------- PAGINATION ----------
  const start = page * itemsPerPage;
  const end = start + itemsPerPage;
  const currentSwipes = filteredRequests.slice(start, end);

  // ---------- HANDLE FILTER ----------
  const handleFilter = (filterKey) => {
    if (activeFilter === filterKey) {
      setActiveFilter("newest");
    } else {
      setActiveFilter(filterKey);
    }
    setPage(0);
    setFilterModel(false);
  };

  // ---------- EMPTY MESSAGE ----------
  const emptyMessage = () => "No swipes yet 😕";

  const FilterItem = ({ icon, label, filterKey, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2 cursor-pointer rounded-lg text-sm text-white hover:bg-white/10 transition relative"
    >
      {icon}
      {label}
      {activeFilter === filterKey && (
        <span className="absolute right-3 w-2 h-2 bg-white rounded-full" />
      )}
    </button>
  );

  const cardBg = light
    ? "bg-[#EDEDED] text-black border-black"
    : "bg-neutral-900 text-white border-neutral-700";
  const cardBorder = light ? "border-black" : "border-neutral-700";
  const buttonBorder = light ? "border-black" : "border-white/50";
  const buttonText = light ? "text-black" : "text-white";
  const iconColor = light ? "text-black" : "text-white";

  // ---------- FETCH REQUESTS ----------
  useEffect(() => {
    const fetchReqs = async () => {
      try {
        const res = await api.get("/api/requests", { withCredentials: true });
        setRequests(res.data.swipes);
        console.log(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReqs();
  }, []);

  // ---------- ESC CLOSE ----------
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setCurrent(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  const updateSwipeStatus = async (id, type) => {
    try {
      let endpoint = type === "accepted"
        ? `/api/matches/accept/${id}`
        : `/api/swipes/${id}`;
      const body = type === "accepted" ? {} : { status: "rejected" };

      const res = await api.patch(endpoint, body, { withCredentials: true });
      console.log("SWIPE RESPONSE:", res.data);

      // Remove swipe from UI immediately
      setRequests((prev) => prev.filter((s) => s._id !== id));
      setCurrent(null);

      if (res.data.matchCreated) {
        // Confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ff0a54", "#ff477e", "#ff85a1", "#fbb1b9", "#f9bec7"],
        });

        // Toast
        toast.success("🎉 It's a Match! You both liked each other's projects!");
        setTimeout(() => {
          navigate(`/chat/${match._id}`);
        }, 1200);
      }
    } catch (err) {
      console.error("SWIPE ERROR:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div
      className={`min-h-screen transition-colors ${light ? "bg-[#EDEDED]" : "bg-black"
        }`}
    >
      <div className="relative px-4 py-6 min-h-screen flex flex-col justify-between">
        {/* ---------- HEADER & FILTER ---------- */}
        <div className="flex items-center justify-around relative">
          <h2 className={`text-2xl font-bold ${iconColor}`}>Requests</h2>

          <div className="relative z-30">
            <button
              className="flex gap-2 cursor-pointer z-30"
              onClick={() => setFilterModel((prev) => !prev)}
            >
              <svg
                className="w-5 h-5 transition-colors duration-500"
                viewBox="0 0 16 16"
                fill={light ? "black" : "white"}
              >
                <path fill-rule="evenodd" clip-rule="evenodd" d="M14.535 1.71H13.5341C13.182 0.713763 12.2318 0 11.115 0C9.9982 0 9.04804 0.713763 8.69595 1.71H0.855C0.382801 1.71 0 2.0928 0 2.565C0 3.0372 0.382801 3.42 0.855 3.42H8.69595C9.04804 4.41624 9.9982 5.13 11.115 5.13C12.2318 5.13 13.182 4.41624 13.5341 3.42H14.535C15.0072 3.42 15.39 3.0372 15.39 2.565C15.39 2.0928 15.0072 1.71 14.535 1.71ZM11.115 3.42C11.5872 3.42 11.97 3.0372 11.97 2.565C11.97 2.0928 11.5872 1.71 11.115 1.71C10.6428 1.71 10.26 2.0928 10.26 2.565C10.26 3.0372 10.6428 3.42 11.115 3.42ZM0 7.695C0 7.22278 0.382801 6.84 0.855 6.84H1.85596C2.20807 5.84376 3.15818 5.13 4.275 5.13C5.39182 5.13 6.34196 5.84376 6.69405 6.84H14.535C15.0072 6.84 15.39 7.22278 15.39 7.695C15.39 8.16722 15.0072 8.55 14.535 8.55H6.69405C6.34196 9.54625 5.39182 10.26 4.275 10.26C3.15818 10.26 2.20807 9.54625 1.85596 8.55H0.855C0.382801 8.55 0 8.16722 0 7.695ZM4.275 8.55C4.74721 8.55 5.13 8.16722 5.13 7.695C5.13 7.22278 4.74721 6.84 4.275 6.84C3.8028 6.84 3.42 7.22278 3.42 7.695C3.42 8.16722 3.8028 8.55 4.275 8.55ZM0.855 11.97C0.382801 11.97 0 12.3528 0 12.825C0 13.2972 0.382801 13.68 0.855 13.68H8.69595C9.04804 14.6762 9.9982 15.39 11.115 15.39C12.2318 15.39 13.182 14.6762 13.5341 13.68H14.535C15.0072 13.68 15.39 13.2972 15.39 12.825C15.39 12.3528 15.0072 11.97 14.535 11.97H13.5341C13.182 10.9738 12.2318 10.26 11.115 10.26C9.9982 10.26 9.04804 10.9738 8.69595 11.97H0.855ZM11.97 12.825C11.97 13.2972 11.5872 13.68 11.115 13.68C10.6428 13.68 10.26 13.2972 10.26 12.825C10.26 12.3528 10.6428 11.97 11.115 11.97C11.5872 11.97 11.97 12.3528 11.97 12.825Z" fill={light ? "black" : "white"} />

              </svg>
            </button>
            {/* FILTER MENU */}
            <AnimatePresence>
              {filterModel && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 1 }}
                  transition={{ type: "tween", duration: 0.6 }}
                  className="absolute top-8 right-0 z-30 w-52 rounded-xl bg-neutral-900 border border-white/10 shadow-xl p-2 origin-top-right"
                >
                  <FilterItem
                    icon={<Sparkles size={16} />}
                    filterKey="oldest"
                    onClick={() => handleFilter("oldest")}
                    label="Oldest First"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* FILTER BACKDROP */}
          <AnimatePresence>
            {filterModel && (
              <motion.div
                onClick={() => setFilterModel(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ---------- MODAL ---------- */}
        {current && (
          <>
            <motion.div
              onClick={() => setCurrent(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
            />
            <motion.div
              layoutId={`card-${current._id}`}
              onClick={(e) => e.stopPropagation()}
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-auto rounded-2xl border p-4 z-20 ${cardBg} ${cardBorder}`}
            >
              <motion.img
                layoutId={`avatar-${current._id}`}
                src={current.swiperId.avatar}
                className="w-full aspect-square rounded-xl"
              />
              <div
                className={`mt-3 space-y-2 border rounded-2xl p-4 text-neutral-500 h-1/2 ${cardBorder}`}
              >
                <div className="flex items-center justify-between">
                  <motion.h2
                    layoutId={`name-${current._id}`}
                    className={`font-semibold ${light ? "text-black" : "text-white"
                      }`}
                  >
                    {current.swiperId.name}
                  </motion.h2>
                </div>
                <motion.p layoutId={`project-${current._id}`} className="text-sm">
                  Project: {current.swiperProjectId?.title}
                </motion.p>
                <p className="text-xs text-neutral-400">
                  Stack: {current.swiperProjectId?.stack}
                </p>
                <motion.p className="text-sm whitespace-pre-line leading-relaxed h-36 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-500/40 scrollbar-track-transparent pb-[25%] [mask-image:linear-gradient(to_top,transparent_0%,black_80%)]"
                  initial={{ filter: "blur(10px)", opacity: 0 }}
                  animate={{ filter: "blur(0px)", opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {current.swiperProjectId?.description}
                </motion.p>
              </div>

              <div className="flex gap-3 pt-2">
                {current.swiperProjectId?.githubUrl && (
                  <a
                    href={current.swiperProjectId.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 text-center py-2 rounded-lg border text-sm font-medium transition ${cardBorder} ${light ? "text-black hover:bg-black/5" : "text-white hover:bg-white/5"
                      }`}
                  >
                    GitHub
                  </a>
                )}
                {current.swiperProjectId?.liveDemoUrl && (
                  <a
                    href={current.swiperProjectId.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition ${light ? "bg-black text-white hover:bg-black/90" : "bg-white text-black hover:bg-white/90"
                      }`}
                  >
                    Live Demo
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* ---------- LIST ---------- */}
        {filteredRequests.length === 0 ? (
          <div className="flex items-center justify-center min-h-screen">
            <p className="text-center text-gray-400">{emptyMessage()}</p>
          </div>
        ) : (
          <motion.div
            key={`${activeFilter}-${page}`}
            initial={{ x: 0, opacity: 0, filter: "blur(15px)" }}
            animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ x: 0, opacity: 0, filter: "blur(4px)" }}
            transition={{ type: "tween", duration: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-4 items-center"
          >
            {currentSwipes.map((swipe) => (
              <motion.div
                key={swipe._id}
                layoutId={`card-${swipe._id}`}
                onClick={() => setCurrent(swipe)}
                className={`flex items-center gap-4 p-6 w-3/4 border rounded-lg cursor-pointer ${cardBg}`}
              >
                <motion.img
                  layoutId={`avatar-${swipe._id}`}
                  src={swipe.swiperId.avatar}
                  className="h-14 w-14 rounded-full"
                />
                <div className="flex-1">
                  <motion.p layoutId={`name-${swipe._id}`} className="font-semibold">
                    {swipe.swiperId.name}
                  </motion.p>
                  <motion.p layoutId={`project-${swipe._id}`} className="text-sm opacity-70">
                    Project: {swipe.swiperProjectId?.title}
                  </motion.p>
                </div>
                <div className="flex gap-4 items-center justify-center">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSwipeStatus(swipe._id, "accepted");
                    }}
                    className="h-10 w-10 flex items-center justify-center rounded-full border border-green-500/50 bg-green-500/20 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(34,197,94,0.8)] transition-all duration-300 ease-out cursor-pointer"
                  >
                    <Check size={18} />
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSwipeStatus(swipe._id, "rejected");
                    }}
                    className="h-10 w-10 flex items-center justify-center rounded-full border border-red-500/50 bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] transition-all duration-300 ease-out cursor-pointer"
                  >
                    <X size={18} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ---------- PAGINATION ---------- */}
        {filteredRequests.length > 0 && (
          <div className="mb-4 flex flex-col items-center gap-3">
            <p className={`text-sm ${iconColor}`}>
              Page {page + 1} of {Math.ceil(filteredRequests.length / itemsPerPage)}
            </p>
            <div className="flex gap-4">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                className={`px-6 py-2 rounded border cursor-pointer ${buttonBorder} ${buttonText} disabled:opacity-50`}
              >
                Prev
              </button>
              <button
                disabled={end >= filteredRequests.length}
                onClick={() => setPage(page + 1)}
                className={`px-6 py-2 rounded border cursor-pointer ${buttonBorder} ${buttonText} disabled:opacity-50`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Request;
