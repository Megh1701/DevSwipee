import express from "express";
import UserInterest from "../models/UserInterestModel.js";
import User from "../models/UserModel.js"
import { hashPassword, comparePassword } from "../utils/authUtils.js";
import { generatetoken } from "../utils/jwtUtils.js";
import Interest from "../models/InterestModel.js";


export const signup = async (req, res) => {
  try {
    const {
      name,
      age,
      email,
      password,
      gender,
      avatar,
      city,
      interests = [],
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });


    const hashed = await hashPassword(password);

    const user = await User.create({
      name,
      age,
      email,
      password: hashed,
      gender,
      avatar,
      city,
      verified: false,
    });

  
    const interestDocs = [];
    for (const interestName of interests) {
      const interest = await Interest.findOneAndUpdate(
        { name: interestName },
        { name: interestName },
        { upsert: true, new: true }
      );
      interestDocs.push(interest);
    }

    const userInterestDocs = interestDocs.map((interest) => ({
      userId: user._id,
      interestId: interest._id,
    }));

    if (userInterestDocs.length > 0) {
      await UserInterest.insertMany(userInterestDocs);
    }

    // 5. Token
    const token = generatetoken(user._id);

    res
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        message: "Signup successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          gender: user.gender,
          avatar: user.avatar,
          city: user.city,
        },
      });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const login = async (req, res) => {
    try {


        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const token = generatetoken(user._id);

        res
            .cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })
            .status(200)
            .json({
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    age: user.age,
                    gender: user.gender,
                    avatar: user.avatar,
                    city: user.city,
                    verified: user.verified
                }
            });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server login error" });
    }
};


export const logout = async (req, res) => {
    res
        .clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })
        .status(200)
        .json({
            message: "Logout successful"
        });
};
