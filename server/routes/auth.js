import express from "express";
import { signIn, signOut, signUp } from "../controller/authController.js";

const authroute = express.Router()

authroute.post('/signup',signUp)
authroute.post('/signin',signIn)
authroute.get('/logout',signOut)

export default authroute