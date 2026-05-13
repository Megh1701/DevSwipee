import UserInterest from "../models/UserInterestModel.js";
import User from "../models/UserModel.js";
import { hashPassword, comparePassword } from "../utils/authUtils.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils.js";

import Interest from "../models/InterestModel.js";


// ================= SIGNUP =================
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
      location,
      interests = [],
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    if (!location || !location.coordinates?.length) {
      return res.status(400).json({
        error: "Location is required",
      });
    }

    const user = await User.create({
      name,
      age,
      email,
      password: hashedPassword,
      gender,
      avatar,
      city,
      location,
      verified: false,
    });

    // Save interests
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

    const accessToken = generateAccessToken(user._id);

    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens = [refreshToken];

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Signup successful",

      accessToken,

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

    res.status(500).json({
      error: "Internal server error",
    });
  }
};


export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      !(await comparePassword(password, user.password))
    ) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const accessToken =
      generateAccessToken(user._id);

    const refreshToken =
      generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);

    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

   res.cookie("accessToken", accessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000,
});

res.status(200).json({
  message: "Login successful",
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
  },
});

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {

    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        error: "No refresh token provided",
      });
    }

    const decoded =
      verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.id);

    if (
      !user ||
      !user.refreshTokens.includes(refreshToken)
    ) {
      return res.status(403).json({
        error: "Invalid refresh token",
      });
    }

    const newAccessToken =
      generateAccessToken(user._id);

  res.cookie("accessToken", newAccessToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 15 * 60 * 1000,
});

res.status(200).json({
  message: "Token refreshed",
});

  } catch (error) {

    console.error("Refresh Token Error:", error);

    res.status(403).json({
      error: "Invalid or expired refresh token",
    });
  }
};


export const logout = async (req, res) => {
  try {

    const { refreshToken } = req.cookies;

    if (refreshToken) {

      const decoded =
        verifyRefreshToken(refreshToken);

      const user = await User.findById(decoded.id);

      if (user) {
        user.refreshTokens =
          user.refreshTokens.filter(
            (token) => token !== refreshToken
          );

        await user.save();
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Logout successful",
    });

  } catch (error) {

    console.error("Logout Error:", error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};


export const getMe = async (req, res) => {
  try {

    res.status(200).json({
      userId: req.user.id,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });
  }
};