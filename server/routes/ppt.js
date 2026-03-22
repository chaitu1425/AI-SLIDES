import express from "express";
import { downloadPPT } from "../controller/pptController.js";
import { verifyToken } from "../middleware/auth.js";

const pptRoute = express.Router();

pptRoute.post("/download", verifyToken, downloadPPT);

export default pptRoute;
