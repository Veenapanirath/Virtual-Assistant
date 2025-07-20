import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        console.log("🔐 isAuth middleware called");
        console.log("🍪 Cookies:", req.cookies);
        
        const token = req.cookies.token;
        
        if (!token) {
            console.error("❌ No token found in cookies");
            return res.status(401).json({ message: "Authentication required - token not found" });
        }
        
        console.log("🎟️ Token found:", token.substring(0, 20) + "...");
        
        const verifytoken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token verified:", verifytoken);
        
        req.userId = verifytoken.userId || verifytoken._id; // Handle both possibilities
        
        if (!req.userId) {
            console.error("❌ No userId found in token payload");
            return res.status(401).json({ message: "Invalid token - no user ID" });
        }
        
        console.log("✅ User authenticated with ID:", req.userId);
        next();
        
    } catch (error) {
        console.error("❌ isAuth error:", error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        return res.status(500).json({ message: "Authentication error" });
    }
}

export default isAuth;