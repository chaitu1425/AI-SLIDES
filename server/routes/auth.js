import express from "express";
import { signIn, signOut, signUp, getMe } from "../controller/authController.js";
import { verifyToken } from "../middleware/auth.js";

const authroute = express.Router();

authroute.post('/signup', signUp);
authroute.post('/signin', signIn);
authroute.get('/logout', signOut);
authroute.get('/me', verifyToken, getMe);

export default authroute;