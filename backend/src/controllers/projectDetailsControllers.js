import ProjectModel from "../models/ProjectModel.js";
import UserModel from "../models/UserModel.js";
export const projectDetailsControllers = async (req, res) => {
  try {
    const {
      title,
      description,
      stack,
      ProjectStatus,
      thumbnail,
      githubUrl,
      liveDemoUrl,
    } = req.body;


    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    console.log("project submission data",req.body)
    const project = await ProjectModel.create({
      title,
      description,
      stack,
      ProjectStatus,
      thumbnailUrl:thumbnail,
      githubUrl,
      liveDemoUrl,
      userId: req.user.id,
    });

    await UserModel.findByIdAndUpdate(
      req.user.id,
      { $push: { projects: project._id } },
      { new: true }
    );
    const user = await UserModel.findById(req.user.id).populate("projects");



    res.status(201).json({
      message: "Project created successfully",
      project,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getprojectDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const project = await ProjectModel.findOne({ userId })
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message || "Internal server error"
    });
  }
}

export const updateprojectDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const updated = await ProjectModel.findOneAndUpdate(
      { _id: id, userId },
      {
        githubUrl: req.body.githubUrl,
        thumbnailUrl: req.body.thumbnail,
        title: req.body.title,
        description: req.body.description,
        stack: req.body.stack,
        ProjectStatus: req.body.ProjectStatus,
        liveDemoUrl: req.body.liveDemoUrl,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyProjectStatus = async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.id);

    const hasProject = user.projects && user.projects.length > 0;

    return res.status(200).json({
      hasProject,
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};