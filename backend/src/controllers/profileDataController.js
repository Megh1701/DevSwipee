import User from "../models/UserModel.js"
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
        const user = await UserModel.findById(userId).updateOne

        if (!user) {
            return res.status(404).json({ message: "Profile not found" });
        }
        console.log(user)

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

