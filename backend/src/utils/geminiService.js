import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyze project quality using Gemini API
 * Returns a score breakdown (0-40 points total)
 */
export async function analyzeProjectQuality(project) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert technical project evaluator. Analyze this developer project and provide a quality score.

Project Title: ${project.title}
Description: ${project.description}
Tech Stack: ${project.stack || "Not specified"}
Status: ${project.ProjectStatus || "Not specified"}
GitHub URL: ${project.githubUrl ? "Provided" : "Not provided"}
Live Demo URL: ${project.liveDemoUrl ? "Provided" : "Not provided"}

Evaluate the project on these criteria and return ONLY a valid JSON object (no markdown, no extra text):

{
  "descriptionQuality": <0-15 score>,
  "descriptionReasoning": "<brief 1-sentence explanation>",
  "technicalDepth": <0-15 score>,
  "technicalReasoning": "<brief 1-sentence explanation>",
  "completeness": <0-10 score>,
  "completenessReasoning": "<brief 1-sentence explanation>",
  "totalScore": <sum of above, 0-40>,
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}

Scoring guidelines:
- descriptionQuality (0-15): Clarity, detail, problem-solving focus, professionalism
- technicalDepth (0-15): Innovation, complexity, technical skills demonstrated
- completeness (0-10): Has URLs, clear stack, realistic status, well-rounded info

Keep suggestions actionable and specific. Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const analysis = JSON.parse(cleanText);
    
    // Validate structure
    if (typeof analysis.totalScore !== 'number' || 
        !Array.isArray(analysis.suggestions)) {
      throw new Error("Invalid response structure from Gemini");
    }
    
    // Clamp score to 0-40
    analysis.totalScore = Math.max(0, Math.min(40, analysis.totalScore));
    
    return analysis;
  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Fallback: basic scoring without AI
    return getFallbackScore(project);
  }
}

/**
 * Generate hash of project description to detect changes
 */
export function hashDescription(description) {
  return crypto.createHash('md5').update(description).digest('hex');
}

/**
 * Fallback scoring when Gemini API fails
 */
function getFallbackScore(project) {
  let descriptionQuality = 0;
  let technicalDepth = 0;
  let completeness = 0;
  
  // Description quality (0-15)
  const wordCount = project.description.trim().split(/\s+/).length;
  if (wordCount >= 150) descriptionQuality += 5;
  if (wordCount >= 200) descriptionQuality += 3;
  if (wordCount >= 300) descriptionQuality += 2;
  if (project.description.length > 500) descriptionQuality += 5;
  
  // Technical depth (0-15)
  if (project.stack && project.stack.length > 0) technicalDepth += 5;
  if (project.stack && project.stack.split(',').length > 2) technicalDepth += 5;
  if (project.ProjectStatus === 'completed') technicalDepth += 5;
  
  // Completeness (0-10)
  if (project.githubUrl) completeness += 3;
  if (project.liveDemoUrl) completeness += 3;
  if (project.thumbnailUrl) completeness += 2;
  if (project.stack) completeness += 2;
  
  const totalScore = descriptionQuality + technicalDepth + completeness;
  
  return {
    descriptionQuality,
    descriptionReasoning: "Fallback scoring based on word count and length",
    technicalDepth,
    technicalReasoning: "Fallback scoring based on stack and status",
    completeness,
    completenessReasoning: "Fallback scoring based on provided URLs and metadata",
    totalScore: Math.min(40, totalScore),
    suggestions: [
      "Add more technical details to your description",
      "Include both GitHub and live demo URLs",
      "Specify your complete tech stack"
    ],
    isFallback: true
  };
}

