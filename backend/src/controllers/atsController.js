import ProjectModel from "../models/ProjectModel.js";
import SwipeModel from "../models/SwipeModel.js";
import MatchModel from "../models/MatchModel.js";
import { analyzeProjectQuality, hashDescription } from "../utils/geminiService.js";

/**
 * Calculate swipe performance score (0-60 points)
 */
async function calculateSwipeScore(projectId) {
  try {
    // Get all swipes for this project
    const allSwipes = await SwipeModel.find({ projectId });
    const totalSwipes = allSwipes.length;
    
    if (totalSwipes === 0) {
      return {
        interestRate: 0,
        acceptanceRate: 0,
        matchRate: 0,
        totalSwipeScore: 0,
        stats: {
          totalSwipes: 0,
          interestedSwipes: 0,
          acceptedSwipes: 0,
          matches: 0
        }
      };
    }
    
    // Count swipes by status
    const interestedSwipes = allSwipes.filter(s => 
      s.status === 'interested' || s.status === 'accepted'
    ).length;
    
    const acceptedSwipes = allSwipes.filter(s => 
      s.status === 'accepted'
    ).length;
    
    // Count matches for this project
    const matches = await MatchModel.countDocuments({ projectId });
    
    // Calculate rates and scores
    const interestRate = (interestedSwipes / totalSwipes) * 30;
    const acceptanceRate = interestedSwipes > 0 
      ? (acceptedSwipes / interestedSwipes) * 20 
      : 0;
    const matchRate = acceptedSwipes > 0 
      ? (matches / acceptedSwipes) * 10 
      : 0;
    
    const totalSwipeScore = interestRate + acceptanceRate + matchRate;
    
    return {
      interestRate: Math.round(interestRate * 10) / 10,
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      matchRate: Math.round(matchRate * 10) / 10,
      totalSwipeScore: Math.round(totalSwipeScore * 10) / 10,
      stats: {
        totalSwipes,
        interestedSwipes,
        acceptedSwipes,
        matches
      }
    };
  } catch (error) {
    console.error("Error calculating swipe score:", error);
    return {
      interestRate: 0,
      acceptanceRate: 0,
      matchRate: 0,
      totalSwipeScore: 0,
      stats: { totalSwipes: 0, interestedSwipes: 0, acceptedSwipes: 0, matches: 0 }
    };
  }
}

/**
 * Get or calculate quality score for a project
 */
async function getQualityScore(project) {
  const currentHash = hashDescription(project.description);
  
  // Check if we have a cached score and description hasn't changed
  if (project.atsQualityScore !== null && 
      project.lastDescriptionHash === currentHash &&
      project.atsQualityAnalysis) {
    return {
      score: project.atsQualityScore,
      analysis: project.atsQualityAnalysis,
      cached: true
    };
  }
  
  // Need to call Gemini API
  const analysis = await analyzeProjectQuality(project);
  
  // Update project with new score
  project.atsQualityScore = analysis.totalScore;
  project.atsQualityAnalysis = analysis;
  project.lastDescriptionHash = currentHash;
  await project.save();
  
  return {
    score: analysis.totalScore,
    analysis,
    cached: false
  };
}

/**
 * GET /api/ats/score/:projectId
 * Get ATS score for a specific project
 */
export async function getProjectATSScore(req, res) {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    const project = await ProjectModel.findOne({ _id: projectId, userId });
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found or unauthorized" 
      });
    }
    
    // Calculate both components
    const swipeScore = await calculateSwipeScore(projectId);
    const qualityScore = await getQualityScore(project);
    
    const totalScore = Math.round(
      (swipeScore.totalSwipeScore + qualityScore.score) * 10
    ) / 10;
    
    res.json({
      success: true,
      projectId,
      projectTitle: project.title,
      totalScore,
      maxScore: 100,
      breakdown: {
        swipePerformance: swipeScore,
        projectQuality: qualityScore
      }
    });
  } catch (error) {
    console.error("Error getting ATS score:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to calculate ATS score" 
    });
  }
}

/**
 * GET /api/ats/my-projects
 * Get ATS scores for all user's projects
 */
export async function getMyProjectsATS(req, res) {
  try {
    const userId = req.user.id;
    
    const projects = await ProjectModel.find({ userId });
    
    if (projects.length === 0) {
      return res.json({
        success: true,
        projects: [],
        message: "No projects found"
      });
    }
    
    // Calculate scores for all projects
    const projectScores = await Promise.all(
      projects.map(async (project) => {
        const swipeScore = await calculateSwipeScore(project._id);
        const qualityScore = await getQualityScore(project);
        
        const totalScore = Math.round(
          (swipeScore.totalSwipeScore + qualityScore.score) * 10
        ) / 10;
        
        return {
          projectId: project._id,
          title: project.title,
          thumbnailUrl: project.thumbnailUrl,
          stack: project.stack,
          status: project.ProjectStatus,
          totalScore,
          swipeScore: swipeScore.totalSwipeScore,
          qualityScore: qualityScore.score,
          stats: swipeScore.stats,
          suggestions: qualityScore.analysis.suggestions,
          breakdown: {
            swipePerformance: swipeScore,
            projectQuality: qualityScore
          }
        };
      })
    );
    
    // Sort by total score descending
    projectScores.sort((a, b) => b.totalScore - a.totalScore);
    
    res.json({
      success: true,
      projects: projectScores
    });
  } catch (error) {
    console.error("Error getting my projects ATS:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch project scores" 
    });
  }
}

