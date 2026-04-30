import User from "../models/UserModel.js"
import UserModel from "../models/UserModel.js";
import UserInterest from "../models/UserInterestModel.js"
import InterestModel from "../models/InterestModel.js";

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

// export const updateprofiledata = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const updatedUser = await UserModel.findByIdAndUpdate(
//       userId,
//       { $set: req.body }, 
//       { new: true }
//     );

//     res.status(200).json(updatedUser);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

export const updateprofiledata = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      interests = [],
      ...basicData
    } = req.body;

    // 1️⃣ Update basic profile fields
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: basicData },
      { new: true }
    );

    // 2️⃣ Remove old interests
    await UserInterest.deleteMany({ userId });

    // 3️⃣ Add new interests
    for (const interestName of interests) {
      let interest = await InterestModel.findOne({ name: interestName });

      // Create if doesn't exist
      if (!interest) {
        interest = await InterestModel.create({
          name: interestName,
        });
      }

      await UserInterest.create({
        userId,
        interestId: interest._id,
      });
    }

    // 4️⃣ Get updated interests
    const updatedInterests = await UserInterest.find({ userId })
      .populate("interestId", "name");

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        ...updatedUser.toObject(),
        interests: updatedInterests.map(
          (item) => item.interestId.name
        ),
      },
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};