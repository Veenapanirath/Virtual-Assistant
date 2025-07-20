import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        console.log("🔐 isAuth middleware called");
        console.log("🍪 Cookies:", req.cookies);
        console.log("📋 Headers:", req.headers.authorization);
        
        let token;
        
        // Check for token in multiple locations
        // 1. Check Authorization header first (Bearer token)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7); // Remove "Bearer " prefix
            console.log("🎟️ Token found in Authorization header");
        }
        // 2. Check cookies as fallback
        else if (req.cookies.token) {
            token = req.cookies.token;
            console.log("🎟️ Token found in cookies");
        }
        // 3. Check custom header as additional fallback
        else if (req.headers['x-auth-token']) {
            token = req.headers['x-auth-token'];
            console.log("🎟️ Token found in custom header");
        }
        
        if (!token) {
            console.error("❌ No token found in cookies, headers, or Authorization");
            return res.status(401).json({ 
                message: "Authentication required - token not found",
                debug: {
                    cookieExists: !!req.cookies.token,
                    authHeaderExists: !!req.headers.authorization,
                    customHeaderExists: !!req.headers['x-auth-token']
                }
            });
        }
        
        console.log("🎟️ Token found:", token.substring(0, 20) + "...");
        
        const verifytoken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token verified:", verifytoken);
        
        req.userId = verifytoken.userId || verifytoken._id || verifytoken.id; // Handle multiple possibilities
        
        if (!req.userId) {
            console.error("❌ No userId found in token payload");
            console.log("Token payload:", verifytoken);
            return res.status(401).json({ message: "Invalid token - no user ID found" });
        }
        
        console.log("✅ User authenticated with ID:", req.userId);
        next();
        
    } catch (error) {
        console.error("❌ isAuth error:", error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: "Invalid token",
                error: error.message 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Token expired",
                expiredAt: error.expiredAt 
            });
        }
        return res.status(500).json({ 
            message: "Authentication error",
            error: error.message 
        });
    }
}

export default isAuth;
