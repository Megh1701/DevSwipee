import jwt from "jsonwebtoken"

export const generatetoken = (userId) =>{

    return jwt.sign(
        {id:userId},
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )
}

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_SECRET);
};