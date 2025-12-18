import React, { useMemo, useState } from "react";
import { motion, motionValue, useTransform, animate } from "framer-motion";



const swipeSound = () => {
  const audio = new Audio("/sounds/swipe-255512.mp3");
  audio.volume = 0.7;
  audio.play().catch(() => {});
};


const ProjectCard = ({
  user,
  onSwipe,
  index,
  isTop,
  profile,
  setDragX,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const x = motionValue(0);
  const y = motionValue(0);

  const opacity = useTransform(x, [-250, 0, 250], [0, 1, 0]);
  const rotate = useTransform(x, [-150, 150], [-30, 30]);

  const initialRotate = useMemo(() => {
    return isTop ? 0 : index % 2 === 0 ? -6 : 6;
  }, [isTop, index]);

  const handleDrag = (_, info) => {
    if (setDragX) setDragX(info.offset.x);
  };

  const handleDragEnd = (_, info) => {
    if (isExpanded) return;

    const threshold = 100;

    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? 1 : -1;
      const targetX = direction * 1000;
      const targetRotate = direction * 60 + initialRotate;

      animate(x, targetX, { type: "spring", stiffness: 200, damping: 20 });
      animate(rotate, targetRotate, {
        type: "spring",
        stiffness: 200,
        damping: 20,
      });

      swipeSound();
      setTimeout(() => onSwipe(user.id), 150);
    } else {
      if (setDragX) setDragX(0);
    }
  };

  return (
    <motion.div
      layout
      layoutId={`card-${user.id}`}
      drag={isExpanded ? false : "x"}
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, y, rotate, opacity }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={() => setIsExpanded((prev) => !prev)}
      initial={{ scale: 0.9, rotate: initialRotate }}
      animate={{ scale: 1, rotate: initialRotate }}
  
      className={`
        absolute flex flex-col overflow-hidden rounded-4xl
        bg-[var(--color-bg-dark)] text-[var(--color-text-dark)]
        border border-[var(--color-border-dark)] shadow-lg cursor-pointer
        ${isExpanded ? "h-[32rem] w-[28rem]" : "h-80 w-96"}
      `}
    >
      {/* Image */}
      <motion.div
        layout
        className={`w-full overflow-hidden rounded-4xl border border-[var(--color-border-dark)]
        ${isExpanded ? "h-72" : "h-56"}`}
      >
        <img
    className="w-full h-full object-cover select-none"
    src={user.avatar}
    alt={user.name}
    draggable="false"
  />
      </motion.div>

      {/* Content */}
      <motion.div layout className="flex-1 p-4">
        <h3 className="text-lg font-semibold">{user.name}</h3>

        {/* Interests */}
        {profile && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.keys(profile.interests)
              .filter((key) => profile.interests[key])
              .map((interest) => (
                <span
                  key={interest}
                  className="px-2 py-1 bg-[var(--color-bg-light)]
                  text-[var(--color-text-light)]
                  border border-[var(--color-border-dark)]
                  text-xs rounded-lg"
                >
                  {interest}
                </span>
              ))}
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            className="mt-4 text-sm opacity-90 space-y-3 z-100"
          >
            <p>{user.bio || "No description available."}</p>

            <button
              onClick={(e) => e.stopPropagation()}
              className="px-4 py-2 rounded-xl bg-white text-black font-medium"
            >
              View Project
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProjectCard;
