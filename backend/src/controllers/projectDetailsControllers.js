import ProjectModel from "../models/ProjectModel.js";
import UserModel from "../models/UserModel.js";
export const projectDetailsControllers = async (req, res) => {
  try {
    const {
      title,
      description,
      stack,
      ProjectStatus,
      thumbnail,   // frontend sends this
      gitHubUrl,   // frontend sends this
      liveDemoUrl,
    } = req.body;
 

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

   const project = await ProjectModel.create({
  title,
  description,
  stack,
  ProjectStatus,
  thumbnailUrl: thumbnail,   // map correctly
  githubUrl: gitHubUrl,     // map correctly
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
