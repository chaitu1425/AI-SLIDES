import express from "express";
import { sendMessage, getChats, getChatById, deleteChat } from "../controller/chatController.js";
import { verifyToken } from "../middleware/auth.js";

const chatRoute = express.Router();

chatRoute.use(verifyToken);

chatRoute.get("/", getChats);
chatRoute.post("/message", sendMessage);
chatRoute.get("/:id", getChatById);
chatRoute.delete("/:id", deleteChat);

export default chatRoute;
