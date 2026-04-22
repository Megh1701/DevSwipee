import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/axios";
import { toast } from "sonner";
import { startATSTour } from "../utils/tourGuide";

const ATSDashboard = ({ light }) => {
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
      console.error("Failed to fetch ATS scores:", error);
      toast.error("Failed to load project scores");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return light ? "text-green-600" : "text-green-400";
    if (score >= 60) return light ? "text-blue-600" : "text-blue-400";
    if (score >= 40) return light ? "text-yellow-600" : "text-yellow-400";
    return light ? "text-red-600" : "text-red-400";
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return "from-green-500/20 to-green-600/20";
    if (score >= 60) return "from-blue-500/20 to-blue-600/20";
    if (score >= 40) return "from-yellow-500/20 to-yellow-600/20";
    return "from-red-500/20 to-red-600/20";
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neutral-600 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-text-dark text-sm">Calculating Profile Scores...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-bg-dark">
        <div className="text-center">
          <p className="text-text-dark text-lg mb-2">No projects found</p>
          <p className="text-neutral-500 text-sm">Create a project to see your profile score</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-bg-dark overflow-y-auto p-8" id="ats-dashboard">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start" id="ats-header">
          <div>
            <h1 className="text-3xl font-bold text-text-dark mb-2">
              Profile Score
            </h1>
            <p className="text-neutral-400 text-sm">
              Track your project performance and quality metrics
            </p>
          </div>
          <button
            onClick={startATSTour}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 16V12M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            How it works
          </button>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="ats-projects">
          {projects.map((project) => (
            <motion.div
              key={project.projectId}
              layoutId={`project-${project.projectId}`}
              onClick={() => setSelectedProject(project)}
              className="relative cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className={`relative bg-gradient-to-br ${getScoreGradient(project.totalScore)} 
                border border-neutral-700 rounded-2xl p-6 overflow-hidden
                hover:border-neutral-600 transition-colors`}>
                
                {/* Score Badge */}
                <div className="absolute top-4 right-4">
                  <div className={`text-2xl font-bold ${getScoreColor(project.totalScore)}`}>
                    {project.totalScore}
                  </div>
                  <div className="text-xs text-neutral-500 text-right">/ 100</div>
                </div>

                {/* Project Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-text-dark mb-2 pr-16">
                    {project.title}
                  </h3>
                  <p className="text-xs text-neutral-400">{project.stack}</p>
                </div>

                {/* Mini Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-black/20 rounded-lg p-2">
                    <div className="text-neutral-500">Swipe Score</div>
                    <div className="text-text-dark font-semibold">
                      {project.swipeScore.toFixed(1)} / 60
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-2">
                    <div className="text-neutral-500">Quality Score</div>
                    <div className="text-text-dark font-semibold">
                      {project.qualityScore.toFixed(1)} / 40
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="mt-4 flex gap-4 text-xs text-neutral-400">
                  <div>👁️ {project.stats.totalSwipes} views</div>
                  <div>❤️ {project.stats.interestedSwipes} likes</div>
                  <div>🤝 {project.stats.matches} matches</div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute inset-x-0 h-px -bottom-0 w-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <DetailModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            getScoreColor={getScoreColor}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Detail Modal Component
const DetailModal = ({ project, onClose, getScoreColor }) => {
  const breakdown = project.breakdown;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      id="ats-detail-modal"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-text-dark mb-1">
              {project.title}
            </h2>
            <p className="text-sm text-neutral-400">{project.stack}</p>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getScoreColor(project.totalScore)}`}>
              {project.totalScore}
            </div>
            <div className="text-sm text-neutral-500">ATS Score</div>
          </div>
        </div>

        {/* Swipe Performance Breakdown */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-dark mb-4">
            📊 Swipe Performance ({breakdown.swipePerformance.totalSwipeScore.toFixed(1)} / 60)
          </h3>
          <div className="space-y-3">
            <ScoreBar
              label="Interest Rate"
              score={breakdown.swipePerformance.interestRate}
              max={30}
              color="blue"
            />
            <ScoreBar
              label="Acceptance Rate"
              score={breakdown.swipePerformance.acceptanceRate}
              max={20}
              color="green"
            />
            <ScoreBar
              label="Match Rate"
              score={breakdown.swipePerformance.matchRate}
              max={10}
              color="purple"
            />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-neutral-500 text-xs">Total Views</div>
              <div className="text-text-dark font-semibold text-lg">
                {breakdown.swipePerformance.stats.totalSwipes}
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-neutral-500 text-xs">Interested</div>
              <div className="text-text-dark font-semibold text-lg">
                {breakdown.swipePerformance.stats.interestedSwipes}
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-neutral-500 text-xs">Accepted</div>
              <div className="text-text-dark font-semibold text-lg">
                {breakdown.swipePerformance.stats.acceptedSwipes}
              </div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-neutral-500 text-xs">Matches</div>
              <div className="text-text-dark font-semibold text-lg">
                {breakdown.swipePerformance.stats.matches}
              </div>
            </div>
          </div>
        </div>

        {/* Quality Analysis */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-dark mb-4">
            ✨ Project Quality ({breakdown.projectQuality.score.toFixed(1)} / 40)
          </h3>
          <div className="space-y-3">
            <ScoreBar
              label="Description Quality"
              score={breakdown.projectQuality.analysis.descriptionQuality}
              max={15}
              color="yellow"
              reasoning={breakdown.projectQuality.analysis.descriptionReasoning}
            />
            <ScoreBar
              label="Technical Depth"
              score={breakdown.projectQuality.analysis.technicalDepth}
              max={15}
              color="cyan"
              reasoning={breakdown.projectQuality.analysis.technicalReasoning}
            />
            <ScoreBar
              label="Completeness"
              score={breakdown.projectQuality.analysis.completeness}
              max={10}
              color="pink"
              reasoning={breakdown.projectQuality.analysis.completenessReasoning}
            />
          </div>
        </div>

        {/* Suggestions */}
        {project.suggestions && project.suggestions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-dark mb-3">
              💡 Improvement Suggestions
            </h3>
            <ul className="space-y-2">
              {project.suggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-neutral-300 bg-black/30 rounded-lg p-3"
                >
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
};

// Score Bar Component
const ScoreBar = ({ label, score, max, color, reasoning }) => {
  const percentage = (score / max) * 100;

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
    cyan: "bg-cyan-500",
    pink: "bg-pink-500",
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-neutral-300">{label}</span>
        <span className="text-sm text-neutral-400">
          {score.toFixed(1)} / {max}
        </span>
      </div>
      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full ${colorClasses[color]}`}
        />
      </div>
      {reasoning && (
        <p className="text-xs text-neutral-500 mt-1 italic">{reasoning}</p>
      )}
    </div>
  );
};

export default ATSDashboard;

