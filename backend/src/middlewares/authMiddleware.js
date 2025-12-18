import { verifyToken } from "../utils/jwtUtils";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.token; 

    if (!token) {
      return res.status(401).json({ message: "Please Log in" }).navigate("/login");
    }

    const decoded = verifyToken(token);

    req.user = { id: decoded.id };

    next(); 
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
