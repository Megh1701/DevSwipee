"use client";

import React, { useMemo, useRef, useState } from "react";
import { Github, ExternalLink, Flag, X, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring, animate } from "framer-motion";

const SWIPE_DISTANCE = 300;
const EXIT_DISTANCE = 1000;

const REPORT_REASONS = [
  {
    id: "inappropriate",
    label: "Inappropriate Content",
    desc: "Offensive language, NSFW, harassment",
  },
  {
    id: "spam",
    label: "Spam / Scam",
    desc: "Promotional or misleading project",
  },
  {
    id: "fake",
    label: "Fake Project / Fake Info",
    desc: "False description, fake links, copied content",
  },
  {
    id: "duplicate",
    label: "Duplicate Project",
    desc: "Same project already exists",
  },
];

/* ─── Report Modal ─────────────────────────────────────────── */
const ReportModal = ({ light, onClose, onSubmit }) => {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const overlay = light ? "bg-black/20" : "bg-black/60";
  const panel = light ? "bg-white border-black/10 text-black" : "bg-neutral-900 border-white/10 text-white";
  const itemBase = light
    ? "border-black/10 hover:border-black/30 hover:bg-black/5"
    : "border-white/10 hover:border-white/20 hover:bg-white/5";
  const itemSelected = light
    ? "border-red-400 bg-red-50 ring-1 ring-red-300"
    : "border-red-500/60 bg-red-500/10 ring-1 ring-red-500/40";
  const btnDisabled = light ? "bg-black/10 text-black/30 cursor-not-allowed" : "bg-white/10 text-white/30 cursor-not-allowed";
  const btnActive = "bg-red-500 hover:bg-red-600 text-white cursor-pointer";
  const closeBtn = light ? "hover:bg-black/10 text-black/50" : "hover:bg-white/10 text-white/40";

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    onSubmit?.(selected);
    setTimeout(onClose, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`absolute inset-0 z-[200] flex items-center justify-center rounded-3xl ${overlay}`}
      onClick={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className={`w-[88%] rounded-2xl border shadow-2xl p-5 ${panel}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-500" />
                <span className="font-semibold text-sm">Report Project</span>
              </div>
              <button
                onClick={onClose}
                className={`p-1 rounded-full transition ${closeBtn}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className={`text-xs mb-3 ${light ? "text-black/50" : "text-white/40"}`}>
              Why are you reporting this?
            </p>

            {/* Reason list */}
            <div className="flex flex-col gap-2 mb-4">
              {REPORT_REASONS.map((r) => (
                <motion.button
                  key={r.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(r.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150 flex items-center justify-between group
                    ${selected === r.id ? itemSelected : itemBase}`}
                >
                  <div>
                    <div className="text-xs font-semibold">{r.label}</div>
                    <div className={`text-[11px] mt-0.5 ${light ? "text-black/45" : "text-white/35"}`}>
                      {r.desc}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-opacity ${selected === r.id ? "opacity-100 text-red-500" : "opacity-0 group-hover:opacity-40"
                      }`}
                  />
                </motion.button>
              ))}
            </div>

            {/* Submit */}
            <button
              disabled={!selected}
              onClick={handleSubmit}
              className={`w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${selected ? btnActive : btnDisabled
                }`}
            >
              Submit Report
            </button>
          </>
        ) : (
          /* Success state */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 gap-3"
          >
            <CheckCircle2 className="w-10 h-10 text-red-500" />
            <p className="font-semibold text-sm">Thanks for the report</p>
            <p className={`text-xs text-center ${light ? "text-black/45" : "text-white/40"}`}>
              We'll review this project shortly.
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

/* ─── ProjectCard ───────────────────────────────────────────── */
const ProjectCard = ({ project, index, isTop, onSwipe, light, swipeBlocked, onReport }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const dragDistance = useRef(0);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-28, 0, 28]);
  const smoothRotate = useSpring(rotate, { stiffness: 180, damping: 22 });
  const opacity = useTransform(x, [-350, -200, 0, 200, 350], [0, 0.5, 1, 0.5, 0]);
  const scale = useTransform(x, [-300, 0, 300], [0.97, isExpanded ? 1.08 : 1, 0.97]);
  const initialRotate = useMemo(() => (isTop ? 0 : index % 2 === 0 ? -6 : 6), [index, isTop]);

  const handleDrag = (_, info) => {
    dragDistance.current = Math.abs(info.offset.x);
  };

  const handleDragEnd = (_, info) => {
    if (!isTop || isExpanded) {
      dragDistance.current = 0;
      return;
    }
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE) {
      const direction = info.offset.x > 0 ? 1 : 0;
      setIsExiting(true);
      animate(x, direction * EXIT_DISTANCE, { duration: 0.4, ease: [0.22, 1, 0.36, 1] });
      setTimeout(() => onSwipe?.(project._id, direction, project.userId), 100);
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 32 });
    }
    dragDistance.current = 0;
  };

  const handleClick = () => {
    if (!isTop || dragDistance.current > 12 || isExiting || showReport) return;
    setIsExpanded((prev) => !prev);
  };

  const handleReportOpen = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setShowReport(true);
  };

  const handleReportSubmit = (reasonId) => {
    onReport?.(project._id, reasonId);
  };

  const cardBg = light ? "bg-[#EDEDED] text-black border-black" : "bg-neutral-900 text-white border-neutral-700";
  const stackBorder = light ? "border-black" : "border-neutral-400";
  const statusBg = light ? "bg-green-100 text-green-800" : "bg-green-500/55 text-green-100";
  const iconBorder = light ? "border-black hover:bg-black/10" : "border-white/10 hover:bg-white/10";
  const iconColor = light ? "text-black" : "text-white";
  const reportBtn = light
    ? "border-black/15 text-black/35 hover:bg-red-50 hover:border-red-300 hover:text-red-500"
    : "border-white/10 text-white/25 hover:bg-red-500/15 hover:border-red-500/40 hover:text-red-400";

  return (
    <motion.div
      layout
      drag={isTop && !isExpanded && !swipeBlocked ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      style={{
        x,
        rotate: isTop ? smoothRotate : initialRotate,
        opacity: isTop ? opacity : 1,
        scale,
        zIndex: isExpanded ? 100 : isTop ? 50 : 10 - index,
        pointerEvents: isExiting ? "none" : "auto",
      }}
      initial={{ scale: 0.95, rotate: initialRotate }}
      animate={{ scale: isExpanded ? 1.05 : 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.8 }}
      className={`
        absolute rounded-3xl overflow-hidden border shadow-xl select-none will-change-transform
        ${cardBg} transition-colors duration-300
        ${isExpanded ? "w-[32rem]" : "w-96"}
        ${isTop && !isExpanded ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
      `}
    >
      {/* IMAGE */}
      <img
        src={project.thumbnailUrl || "/placeholder.svg"}
        alt={project.title}
        draggable={false}
        className={`w-full object-cover pointer-events-none ${isExpanded ? "h-82" : "h-48"}`}
      />

      <span className={`px-3 py-1 text-xs font-bold absolute top-5 right-5 rounded-full border ${statusBg} capitalize`}>
        {project.ProjectStatus}
      </span>

      {/* CONTENT */}
      <div className="p-6 w-full flex flex-col">
        <div>
          <h3 className="text-2xl font-bold">{project.title}</h3>

        </div>
        {/* USER INFO */}
        <div className="flex items-center justify-between gap-3 mt-3">
          <div className="flex items-center gap-3">
            <img
              src={project.userId?.avatar}
              className="w-9 h-9 rounded-full"
            />
            <div>
              <p className="text-sm font-medium">
                {project.userId?.name}
              </p>
              <p className="text-xs opacity-60">
                {project.userId?.city}
              </p>
            </div>
          </div>

          <div>
            <span className={`p-2 text-sm border rounded-full mt-2 inline-block ${stackBorder}`}>
              {project.stack}
            </span>
          </div>
        </div>

        {/* DESCRIPTION */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex-1 overflow-y-auto mt-4 pr-1 [mask-image:linear-gradient(to_top,transparent_0%,black_80%)]"
            style={{ maxHeight: "150px" }}
          >
            <p className="text-sm opacity-80 leading-relaxed whitespace-pre-line pb-[25%]">
              {project.description}
            </p>
          </motion.div>
        )}

        {/* BUTTONS */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-auto flex flex-col gap-3 pt-3"
          >
            {/* Github + Live Demo */}
            <div className="flex justify-center gap-4">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-full border transition flex items-center gap-2 ${iconBorder}`}
                >
                  <Github className={`w-5 h-5 ${iconColor}`} />
                  <div>Github</div>
                </a>
              )}
              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 rounded-full border transition flex items-center gap-2 ${iconBorder}`}
                >
                  <ExternalLink className={`w-5 h-5 ${iconColor}`} />
                  <div>Live Demo</div>
                </a>
              )}
            </div>

            {/* Report button */}
            <div className="flex justify-center">
              <button
                onClick={handleReportOpen}
                className={`px-4 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-2 text-xs ${reportBtn}`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Report</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* REPORT MODAL — inside card so it clips to rounded corners */}
      <AnimatePresence>
        {showReport && (
          <ReportModal
            light={light}
            onClose={() => setShowReport(false)}
            onSubmit={handleReportSubmit}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProjectCard;