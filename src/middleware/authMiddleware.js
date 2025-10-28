// authMiddleware.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // لازم يكون ستيرينغ
  if (!authHeader || typeof authHeader !== "string") {
    return res.status(401).json({ message: "No token provided" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // اعطي الريكوست بيانات المستخدم
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
