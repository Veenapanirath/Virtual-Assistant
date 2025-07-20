// config/cloudinary.js - Fixed Environment Loading Order
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Function to check and configure Cloudinary (called lazily)
let isConfigured = false;
let configurationResult = null;

const ensureCloudinaryConfigured = () => {
    if (isConfigured) return configurationResult;
    
    // Debug environment variables (only log once)
    console.log("🔧 Cloudinary Environment Variables Check:");
    console.log("   CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ Found" : "❌ Missing");
    console.log("   CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ Found" : "❌ Missing");
    console.log("   CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ Found" : "❌ Missing");

    // Configure cloudinary with validation
    const cloudinaryConfig = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    };

    // Validate all required fields are present
    if (!cloudinaryConfig.cloud_name || !cloudinaryConfig.api_key || !cloudinaryConfig.api_secret) {
        console.error("❌ CRITICAL: Missing Cloudinary environment variables!");
        console.error("   Make sure your .env file contains:");
        console.error("   CLOUDINARY_CLOUD_NAME=your_cloud_name");
        console.error("   CLOUDINARY_API_KEY=your_api_key");
        console.error("   CLOUDINARY_API_SECRET=your_api_secret");
        console.error("   Cloudinary uploads will fail until this is fixed!");
        
        configurationResult = { success: false, config: null };
    } else {
        console.log("✅ Cloudinary configuration loaded successfully");
        cloudinary.config(cloudinaryConfig);
        configurationResult = { success: true, config: cloudinaryConfig };
    }
    
    isConfigured = true;
    return configurationResult;
};

const uploadoncloudinary = async (filePath) => {
    console.log("☁️ Starting Cloudinary upload for:", filePath);
    
    if (!filePath) {
        console.error("❌ No file path provided to uploadoncloudinary");
        return null;
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error("❌ File does not exist at path:", filePath);
        return null;
    }

    // Ensure Cloudinary is configured (lazy loading)
    const configResult = ensureCloudinaryConfigured();
    
    if (!configResult.success) {
        console.error("❌ Cloudinary not configured - cannot upload");
        // Clean up local file
        try {
            fs.unlinkSync(filePath);
            console.log("🗑️ Local file cleaned up due to configuration error");
        } catch (deleteError) {
            console.warn("⚠️ Warning: Could not delete local file:", deleteError.message);
        }
        return null;
    }

    try {
        console.log("📤 Uploading to Cloudinary...");
        console.log("   Config Cloud Name:", configResult.config.cloud_name);
        console.log("   Config API Key:", configResult.config.api_key ? configResult.config.api_key.substring(0, 8) + "..." : "Missing");
        
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "auto",
            folder: "assistants",
            transformation: [
                { width: 500, height: 500, crop: "fill" },
                { quality: "auto" }
            ]
        });
        
        console.log("✅ Cloudinary upload successful:");
        console.log("   URL:", uploadResult.secure_url);
        console.log("   Public ID:", uploadResult.public_id);
        
        // Delete local file after successful upload
        try {
            fs.unlinkSync(filePath);
            console.log("🗑️ Local file deleted successfully");
        } catch (deleteError) {
            console.warn("⚠️ Warning: Could not delete local file:", deleteError.message);
        }
        
        return uploadResult.secure_url;
        
    } catch (error) {
        console.error("❌ Cloudinary upload error:", error);
        console.error("   Error name:", error.name);
        console.error("   Error message:", error.message);
        
        // Clean up local file even if upload failed
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log("🗑️ Local file cleaned up after upload failure");
            }
        } catch (deleteError) {
            console.warn("⚠️ Warning: Could not delete local file after upload failure:", deleteError.message);
        }
        
        return null;
    }
}

export default uploadoncloudinary;

// Alternative: Export both the function and cloudinary instance
export { cloudinary };