import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectdb from "./config/connectdb.js"
import { Chat, editPPT, generatePPT, previewPPT } from "./controller/search.controller.js"
dotenv.config()

const app = express()
const PORT = 8000
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}))

app.get("/",(req,res)=>{
    res.send("hello");
})

app.post("/api/chat",Chat);
app.post("/api/generate",generatePPT);
app.post("/api/edit",editPPT);
app.post("/api/preview",previewPPT);

app.listen(PORT ,()=>{
    console.log(`Server running ${PORT}`);
    connectdb()
})