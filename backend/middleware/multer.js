import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = "../uploads";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Created upload directory:", uploadDir);
}

// Define storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Fixed path - relative to project root
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        console.log("📎 Generated filename:", uniqueName);
        cb(null, uniqueName);
    },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
    console.log("🔍 File filter check:", file.mimetype);
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Create upload middleware
const upload = multer({
    storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 // Only 1 file at a time
    },
    fileFilter
});

export default upload;