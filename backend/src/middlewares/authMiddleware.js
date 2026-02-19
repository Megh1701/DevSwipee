import { verifyToken } from "../utils/jwtUtils.js";

const authMiddleware = (req, res, next) => {
  try {

    const token = req.cookies.access_token; 
    if (!token) {
      return res.status(401).json({ message: "Please log in" });
    }
    const decoded = verifyToken(token);

    req.user = { id: decoded.id };

    next(); 
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
