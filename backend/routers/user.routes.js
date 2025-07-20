import express from 'express'
import { askAssistant, getcurrentuser, updateAssistant } from '../controllers/user.controller.js'
import isAuth from '../middleware/isAuth.js'
import upload from '../middleware/multer.js'

const userRouter = express.Router()

userRouter.get("/current", isAuth, getcurrentuser)
// IMPORTANT: Add isAuth middleware to protect the update route
userRouter.post("/update", isAuth, upload.single("assistantImage"), updateAssistant)
userRouter.post("/askassistant",isAuth,askAssistant)

export default userRouter;
