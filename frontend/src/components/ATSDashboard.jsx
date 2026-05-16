import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/axios";
import { toast } from "sonner";
import { startATSTour } from "../utils/tourGuide";


const ATSDashboard = ({ light = false }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjectScores();
  }, []);

  const fetchProjectScores = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/ats/my-projects");
      setProjects(res.data.projects || []);
    } catch (error) {
      toast.error("Failed to load project scores");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "from-emerald-400 to-green-500";
    if (score >= 60) return "from-blue-400 to-blue-500";
    if (score >= 40) return "from-amber-400 to-yellow-500";
    return "from-red-400 to-red-500";
  };

  const theme = {
    bg: light ? "bg-gray-50" : "bg-black",
    card: light ? "bg-white/80" : "bg-gray-950/80",
    text: light ? "text-gray-900" : "text-white",
    subtext: light ? "text-gray-600" : "text-gray-400",
    border: light ? "border-gray-200" : "border-gray-800",
    borderLight: light ? "border-gray-100" : "border-gray-700",
    hoverCard: light ? "hover:bg-gray-100/80" : "hover:bg-gray-900/80",
    glow: light ? "from-blue-100/30 to-purple-100/30" : "from-blue-600/20 to-purple-600/20",
    spinnerBorder: light ? "border-gray-300" : "border-gray-700",
    spinnerTop: light ? "border-t-blue-600" : "border-t-blue-500",
    modalBg: light ? "from-white/95 to-gray-100/95" : "from-gray-900/95 to-gray-950/95",
    modalBg2: light ? "bg-gray-900/40" : "bg-black/60",
    statBg: light ? "bg-gray-100/60" : "bg-gray-800/30",
    statBgHover: light ? "hover:bg-gray-100/80" : "hover:bg-gray-800/50",
    progressBg: light ? "bg-gray-200/60" : "bg-gray-800/50",
  };

  if (loading) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${theme.bg}`}>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            className={`w-12 h-12 rounded-full border-2 ${theme.spinnerBorder} ${theme.spinnerTop}`}
          />
          <p className={`${theme.subtext} text-sm`}>Calculating Profile Scores...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${theme.bg}`}>
        <div className="text-center">
          <p className={`${theme.text} text-lg mb-2`}>No projects found</p>
          <p className={`${theme.subtext} text-sm`}>Create a project to see your profile score</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-full w-full overflow-x-hidden ${theme.bg} px-4 sm:px-6 md:px-8 py-8 sm:py-12 transition-colors duration-300`} id="ats-dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
          id="ats-header"
        >
          <div>
            <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${theme.text} mb-3 tracking-tight`}>
              Profile Score
            </h1>
            <p className={`${theme.subtext} text-sm sm:text-base max-w-md`}>
              Track your project performance and quality metrics in real-time
            </p>
          </div>
          <motion.button
            onClick={startATSTour}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-blue-500/50 w-fit`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            How it works
          </motion.button>
        </motion.div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" id="ats-projects">
          {projects.map((project, idx) => (
            <motion.div
              key={project.projectId}
              layoutId={`project-${project.projectId}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onClick={() => setSelectedProject(project)}
              className="cursor-pointer group"
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative h-full"
              >
                {/* Glow Background */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${theme.glow} rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Main Card */}
                <div className={`relative h-full bg-gradient-to-br ${theme.card} backdrop-blur-sm border ${theme.border} ${theme.hoverCard} rounded-2xl p-6 sm:p-7 overflow-hidden transition-all duration-300`}>
                  {/* Score Badge - Rounded Pill */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute top-5 right-5 sm:top-6 sm:right-6 bg-gradient-to-r ${getScoreColor(project.totalScore)} rounded-full px-4 py-2 shadow-lg`}
                  >
                    <div className="text-white text-lg sm:text-xl font-bold">
                      {project.totalScore}
                    </div>
                    <div className="text-xs text-white/80 font-medium text-center">ATS Score</div>
                  </motion.div>

                  <div className="mb-6 pr-24">
                    <h3 className={`text-lg sm:text-xl font-semibold ${theme.text} mb-2 line-clamp-2`}>
                      {project.title}
                    </h3>
                    <p className={`text-xs sm:text-sm ${theme.subtext} font-medium`}>{project.stack}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className={`${theme.statBg} rounded-xl p-3 transition-colors duration-300 border ${theme.borderLight}`}>
                      <div className={`text-xs ${theme.subtext} font-medium mb-1`}>Swipe Score</div>
                      <div className={`text-sm sm:text-base font-semibold ${theme.text}`}>
                        {project.swipeScore.toFixed(1)}
                      </div>
                      <div className={`text-xs ${light ? "text-gray-500" : "text-gray-600"}`}>/ 60</div>
                    </div>
                    <div className={`${theme.statBg} rounded-xl p-3 transition-colors duration-300 border ${theme.borderLight}`}>
                      <div className={`text-xs ${theme.subtext} font-medium mb-1`}>Quality</div>
                      <div className={`text-sm sm:text-base font-semibold ${theme.text}`}>
                        {project.qualityScore.toFixed(1)}
                      </div>
                      <div className={`text-xs ${light ? "text-gray-500" : "text-gray-600"}`}>/ 40</div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className={`grid grid-cols-3 gap-2 pt-4 border-t ${theme.borderLight}`}>
                    <div className="text-center">
                      <div className={`text-xs ${theme.subtext} mb-1`}>Views</div>
                      <div className={`text-sm font-semibold ${light ? "text-gray-700" : "text-gray-300"}`}>{project.stats.totalSwipes}</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs ${theme.subtext} mb-1`}>Likes</div>
                      <div className={`text-sm font-semibold ${light ? "text-gray-700" : "text-gray-300"}`}>{project.stats.interestedSwipes}</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-xs ${theme.subtext} mb-1`}>Matches</div>
                      <div className={`text-sm font-semibold ${light ? "text-gray-700" : "text-gray-300"}`}>{project.stats.matches}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <DetailModal project={selectedProject} onClose={() => setSelectedProject(null)} getScoreColor={getScoreColor} theme={theme} light={light} />
        )}
      </AnimatePresence>
    </div>
  );
};



const DetailModal = ({ project, onClose, getScoreColor, theme, light }) => {
  const breakdown = project.breakdown;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className={`fixed inset-0 ${theme.modalBg2} backdrop-blur-md z-50 flex items-center justify-center lg:justify-start p-4 lg:pl-[280px] transition-colors duration-300`}
      id="ats-detail-modal"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
       className={`w-full overflow-y-auto scrollbar-hide max-w-3xl max-h-[90vh] rounded-2xl bg-gradient-to-br ${theme.modalBg} backdrop-blur-xl border ${theme.border} p-6 sm:p-8 transition-colors duration-300 lg:ml-[260px]`}
       >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6 border-b ${theme.borderLight}`}
        >
          <div>
            <h2 className={`text-2xl sm:text-3xl font-bold ${theme.text} mb-2`}>{project.title}</h2>
            <p className={`text-sm ${theme.subtext} font-medium`}>{project.stack}</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`bg-gradient-to-r ${getScoreColor(project.totalScore)} rounded-full px-6 py-3 shadow-lg flex flex-col items-center w-fit`}
          >
            <div className="text-white text-3xl sm:text-4xl font-bold">{project.totalScore}</div>
            <div className="text-xs sm:text-sm text-white/80 font-medium">ATS Score</div>
          </motion.div>
        </motion.div>

        {/* Swipe Performance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h3 className={`text-lg sm:text-xl font-semibold ${theme.text} mb-6 flex items-center gap-2`}>
            <span>📊</span>
            Swipe Performance
            <span className={`text-sm font-normal ${theme.subtext} ml-auto`}>{breakdown.swipePerformance.totalSwipeScore.toFixed(1)} / 60</span>
          </h3>
          <div className="space-y-4 mb-6">
            <ScoreBar label="Interest Rate" score={breakdown.swipePerformance.interestRate} max={30} color="blue" theme={theme} />
            <ScoreBar label="Acceptance Rate" score={breakdown.swipePerformance.acceptanceRate} max={20} color="emerald" theme={theme} />
            <ScoreBar label="Match Rate" score={breakdown.swipePerformance.matchRate} max={10} color="purple" theme={theme} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Views", value: breakdown.swipePerformance.stats.totalSwipes },
              { label: "Interested", value: breakdown.swipePerformance.stats.interestedSwipes },
              { label: "Accepted", value: breakdown.swipePerformance.stats.acceptedSwipes },
              { label: "Matches", value: breakdown.swipePerformance.stats.matches },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className={`${theme.statBg} rounded-xl p-4 border ${theme.borderLight} transition-colors duration-300`}
              >
                <div className={`text-xs ${theme.subtext} font-medium mb-2`}>{stat.label}</div>
                <div className={`text-2xl font-bold ${theme.text}`}>{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quality Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className={`text-lg sm:text-xl font-semibold ${theme.text} mb-6 flex items-center gap-2`}>
            <span>✨</span>
            Project Quality
            <span className={`text-sm font-normal ${theme.subtext} ml-auto`}>{breakdown.projectQuality.score.toFixed(1)} / 40</span>
          </h3>
          <div className="space-y-4">
            <ScoreBar
              label="Description Quality"
              score={breakdown.projectQuality.analysis.descriptionQuality}
              max={15}
              color="amber"
              reasoning={breakdown.projectQuality.analysis.descriptionReasoning}
              theme={theme}
            />
            <ScoreBar
              label="Technical Depth"
              score={breakdown.projectQuality.analysis.technicalDepth}
              max={15}
              color="cyan"
              reasoning={breakdown.projectQuality.analysis.technicalReasoning}
              theme={theme}
            />
            <ScoreBar
              label="Completeness"
              score={breakdown.projectQuality.analysis.completeness}
              max={10}
              color="pink"
              reasoning={breakdown.projectQuality.analysis.completenessReasoning}
              theme={theme}
            />
          </div>
        </motion.div>

        {/* Suggestions */}
        {project.suggestions && project.suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-8"
          >
            <h3 className={`text-lg sm:text-xl font-semibold ${theme.text} mb-4 flex items-center gap-2`}>
              <span>💡</span>
              Improvement Suggestions
            </h3>
            <ul className="space-y-2">
              {project.suggestions.map((suggestion, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className={`flex items-start gap-3 text-sm ${light ? "text-gray-700" : "text-gray-300"} ${theme.statBg} rounded-lg p-4 border ${theme.borderLight} transition-colors duration-300`}
                >
                  <span className="text-blue-600 font-bold mt-0.5">→</span>
                  <span>{suggestion}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          onClick={onClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/50`}
        >
          Close
        </motion.button>
      </motion.div>
    </motion.div>
  );
};


const ScoreBar = ({ label, score, max, color, reasoning, theme }) => {
  const percentage = (score / max) * 100;

  const colorClasses = {
    blue: { bg: "bg-blue-500", glow: "shadow-blue-500/50" },
    emerald: { bg: "bg-emerald-500", glow: "shadow-emerald-500/50" },
    purple: { bg: "bg-purple-500", glow: "shadow-purple-500/50" },
    amber: { bg: "bg-amber-500", glow: "shadow-amber-500/50" },
    cyan: { bg: "bg-cyan-500", glow: "shadow-cyan-500/50" },
    pink: { bg: "bg-pink-500", glow: "shadow-pink-500/50" },
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className={`text-sm font-medium ${theme.text}`}>{label}</span>
        <span className={`text-sm font-semibold ${theme.subtext}`}>
          {score.toFixed(1)} / {max}
        </span>
      </div>
      <div className={`w-full rounded-full h-3 overflow-hidden border ${theme.borderLight} ${theme.progressBg}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${colorClasses[color].bg} rounded-full shadow-lg ${colorClasses[color].glow}`}
        />
      </div>
      {reasoning && <p className={`text-xs ${theme.subtext} mt-2 italic`}>{reasoning}</p>}
    </div>
  );
};

export default ATSDashboard;
