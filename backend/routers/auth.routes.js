import express from 'express'
import { Login, Logout, signUp } from '../controllers/auth.controller.js'

const authRouter=express.Router()

authRouter.post("/SignUp",signUp)
authRouter.post("/Signin",Login)
authRouter.get("/logout",Logout)



export default authRouter
