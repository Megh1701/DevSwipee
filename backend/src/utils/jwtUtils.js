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