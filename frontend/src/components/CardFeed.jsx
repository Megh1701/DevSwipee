import React, { useState, useEffect, useCallback, useRef } from "react";
import ProjectCard from "./ProjectCard";
import { useProfile } from "@/context/profileData";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

const VISIBLE_CARDS  = 3;
const PREFETCH_AT    = 2;

// ── tiny helpers ──────────────────────────────────────────────
const getSeenIds = () => {
  try { return new Set(JSON.parse(localStorage.getItem("seen_ids") || "[]")); }
  catch { return new Set(); }
};
const addSeenId = (id) => {
  const s = getSeenIds(); s.add(id);
  try { localStorage.setItem("seen_ids", JSON.stringify([...s])); } catch {}
};
const isBlocked  = () => localStorage.getItem("swipe_blocked") === "true";
const setBlocked = () => localStorage.setItem("swipe_blocked", "true");

// ─────────────────────────────────────────────────────────────
const CardFeed = ({ light, filters }) => {
  const { profile } = useProfile();
  const navigate    = useNavigate();

  const [projects,     setProjects]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [hasMore,      setHasMore]      = useState(true);
  const [swipeBlocked, setSwipeBlocked] = useState(isBlocked);  // reads localStorage on mount

  const page       = useRef(0);
  const fetching   = useRef(false);
  const hasMoreRef = useRef(true);

  // ── fetch ────────────────────────────────────────────────
  const fetchProjects = useCallback(async () => {
    if (fetching.current || !hasMoreRef.current) return;
    fetching.current = true;
    setLoading(true);

    try {
      const { data } = await api.get("/api/feed", {
        params: { page: page.current, ...filters },
        withCredentials: true,
      });

      if (!data?.length) {
        hasMoreRef.current = false;
        setHasMore(false);
        return;
      }

      // filter out already-seen cards
      const fresh = data.filter((p) => !getSeenIds().has(p._id));
      if (fresh.length) {
        page.current += 1;
        setProjects((prev) => [...prev, ...fresh]);
      } else {
        page.current += 1;
        fetching.current = false;
        setLoading(false);
        fetchProjects();   // skip this page, try next
        return;
      }
    } catch (err) {
      if (err.response?.status === 401) navigate("/", { replace: true });
    } finally {
      fetching.current = false;
      setLoading(false);
    }
  }, [filters, navigate]);

  // reset when filters change
  useEffect(() => {
    page.current     = 0;
    hasMoreRef.current = true;
    fetching.current = false;
    setProjects([]);
    setHasMore(true);
  }, [filters]);

  // initial load (and after filter reset)
  useEffect(() => {
    if (projects.length === 0 && hasMore) fetchProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore]);

  // ── swipe ────────────────────────────────────────────────
  const handleSwipe = useCallback(async (projectId, direction, ownerId) => {
    if (swipeBlocked) return;

    // optimistic: remove card + remember it immediately
    addSeenId(projectId);
    setProjects((prev) => {
      const next = prev.filter((p) => p._id !== projectId);
      if (next.length <= PREFETCH_AT && !fetching.current && hasMoreRef.current) {
        setTimeout(fetchProjects, 0);
      }
      return next;
    });

    try {
      await api.post("/api/swipe", { projectId, ownerId, direction }, { withCredentials: true });
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 429) {
        setBlocked();           // persist
        setSwipeBlocked(true);  // update UI
      }
    }
  }, [swipeBlocked, fetchProjects]);

  // ── render ───────────────────────────────────────────────
  const visibleCards = projects.slice(0, VISIBLE_CARDS);

  return (
    <div className="relative w-full h-2/4 flex justify-center items-center">

      {!projects.length && !loading && !swipeBlocked && (
        <p className="text-center text-neutral-400 text-lg">
          You're all caught up! ✅
        </p>
      )}

      <AnimatePresence>
        {visibleCards.slice().reverse().map((project, idx) => (
          <ProjectCard
            key={project._id}
            project={project}
            index={idx}
            profile={profile}
            isTop={idx === visibleCards.length - 1}
            onSwipe={handleSwipe}
            light={light}
            swipeBlocked={swipeBlocked}
          />
        ))}
      </AnimatePresence>

      {swipeBlocked && (
        <div className="fixed top-0 right-0 h-screen w-[75%] bg-black/70 backdrop-blur-md flex flex-col justify-center items-center z-[9999]">
          <p className="text-white text-3xl font-bold mb-3">🚫 Daily Limit Reached</p>
          <p className="text-neutral-300 text-sm">Come back tomorrow to swipe more</p>
          <button className="mt-6 px-6 py-3 bg-white text-black rounded-full font-semibold hover:scale-105 transition">
            Upgrade for Unlimited Swipes ⚡
          </button>
        </div>
      )}

      {loading && <p className="absolute bottom-2 text-sm text-neutral-400">Loading…</p>}
    </div>
  );
};

export default CardFeed;