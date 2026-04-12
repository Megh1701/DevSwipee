import User from "../models/UserModel.js"
import UserModel from "../models/UserModel.js";
import UserInterest from "../models/UserInterestModel.js"

export const fetchprofiledata = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        const interests = await UserInterest.find({ userId })
            .populate("interestId", "name");

        const interestList = interests.map(i => i.interestId.name);
        
        res.status(200).json({
            ...user.toObject(),
            interests: interestList,
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateprofiledata = async (req, res) => {
  try {
    const userId = req.user.id;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: req.body }, // only updates provided fields
      { new: true }
    );

    res.status(200).json(updatedUser);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
