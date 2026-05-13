import jwt from "jsonwebtoken";

// Generate Access Token
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // Access token expires in 15 minutes
  );
};

// Generate Refresh Token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" } // Refresh token expires in 7 days
  );
};

// Verify Access Token
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Verify Refresh Token
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_SECRET);
};