import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectdb from "./config/connectdb.js";
import authroute from "./routes/auth.js";
import chatRoute from "./routes/chat.js";
import pptRoute from "./routes/ppt.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
}));

app.get("/", (_req, res) => res.json({ status: "AI Slides API running" }));

app.use("/api/auth", authroute);
app.use("/api/chat", chatRoute);
app.use("/api/ppt", pptRoute);

connectdb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Server running on ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    });
