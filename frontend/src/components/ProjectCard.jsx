"use client";

import React, { useMemo, useRef, useState } from "react";
import { Github, ExternalLink } from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring, animate } from "framer-motion";

const SWIPE_DISTANCE = 300;
const EXIT_DISTANCE = 1000;

const ProjectCard = ({ project, index, isTop, onSwipe, light }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
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
    if (!isTop || dragDistance.current > 12 || isExiting) return;
    setIsExpanded(prev => !prev);
  };

  const cardBg = light ? "bg-[#EDEDED] text-black border-black" : "bg-neutral-900 text-white border-neutral-700";
  const stackBorder = light ? "border-black" : "border-neutral-400";
  const statusBg = light ? "bg-green-100 text-green-800" : "bg-green-500/55 text-green-100";
  const iconBorder = light ? "border-black hover:bg-black/10" : "border-white/10 hover:bg-white/10";
  const iconColor = light ? "text-black" : "text-white";

  return (
    <motion.div
      layout
      drag={isTop && !isExpanded ? "x" : false}
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
        className={`w-full object-cover pointer-events-none ${isExpanded ? "h-80" : "h-48"}`}
      />

      <span className={`px-3 py-1 text-xs font-bold absolute top-5 right-5 rounded-full border ${statusBg} capitalize`}>
        {project.ProjectStatus}
      </span>

      {/* CONTENT */}
      <div className="p-6 w-full flex flex-col">
        <div>
          <h3 className="text-2xl font-bold">{project.title}</h3>
          <span className={`p-2 text-sm border rounded-full mt-2 inline-block ${stackBorder}`}>
            {project.stack}
          </span>
        </div>

        {/* DESCRIPTION */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex-1 overflow-y-auto mt-4 pr-1  [mask-image:linear-gradient(to_top,transparent_0%,black_80%)]"
            style={{ maxHeight: "150px" }}
          >
            <p className="text-sm opacity-80 leading-relaxed whitespace-pre-line  pb-[25%]">
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
            className="mt-auto flex justify-center gap-4  pt-3"
          >
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
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;
