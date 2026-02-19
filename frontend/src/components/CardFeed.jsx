import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import ProjectCard from "./ProjectCard";
import { useProfile } from "@/context/profileData";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

const VISIBLE_CARDS = 3;
const PREFETCH_AT = 2;

const CardFeed = ({ light }) => {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/api/feed?page=${page}`, {
        withCredentials: true,
      });

      if (!data?.length) {
        setHasMore(false);
        return;
      }

      setProjects((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, navigate]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSwipe = async (projectId, direction, ownerId) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p._id !== projectId);
      if (updated.length === PREFETCH_AT) fetchProjects();
      return updated;
    });

    try {
      await api.post("/api/swipe", {
        projectId,
        ownerId,
        direction: direction,
      });
      console.log("Swipe recorded:", projectId, direction);
    } catch (err) {
      console.error("Error recording swipe:", err);
    }
  };

  const visibleCards = projects.slice(0, VISIBLE_CARDS);

  return (
    <div className="relative w-full h-2/4 flex justify-center items-center">
      {/* EMPTY STATE */}
      {!projects.length && !loading && (
        <p className="text-center text-neutral-400 text-lg">
          You’re all caught up! ✅ No new projects for now, but more opportunities are coming soon.
        </p>
      )}

      {/* CARDS */}
      <AnimatePresence>
        {visibleCards
          .slice()
          .reverse()
          .map((project, idx) => (
            <ProjectCard
              key={project._id}
              project={project}
              index={idx}
              profile={profile}
              isTop={idx === visibleCards.length - 1}
              onSwipe={handleSwipe}
              light={light}
            />
          ))}
      </AnimatePresence>

      {/* LOADING */}
      {loading && (
        <p className="absolute bottom-2 text-sm text-neutral-400">
          Loading...
        </p>
      )}
    </div>
  );
};

export default CardFeed;
