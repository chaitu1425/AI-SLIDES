import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import connectdb from "./config/connectdb.js"
import { SearchQuery } from "./controller/search.controller.js"
import { GenerateDocument } from "./controller/generatecontroller.js"
import { EditDocument } from "./controller/editcontroller.js"
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

app.post("/search",SearchQuery);
app.post("/generate",GenerateDocument);
app.post("/edit",EditDocument);

app.listen(PORT ,()=>{
    console.log(`Server running ${PORT}`);
    connectdb()
    
})