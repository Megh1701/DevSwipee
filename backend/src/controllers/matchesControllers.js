import UserModel from "../models/UserModel";
import { authMiddleware } from "../middlewares/authMiddleware";
import MatchModel from "../models/MatchModel";
import { request } from "express";

export const matchesControllers = async (req, res) => {

    try {
        const myId = req.user.id;

        const requests = await Match.find({
            projectId: req.user.projectId, // assuming you store your project id in user doc or frontend sends it
            createdBy: { $ne: myId },
        })
            .populate("createdBy", "name email");

        if(requests.length===0){
            res.json({ message: "no requests" })
        }
        res.json(requests);

    } catch (error) {

        console.error(err);
        res.status(500).json({ message: "Failed to fetch requests" });
    }

}