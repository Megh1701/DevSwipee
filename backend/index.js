import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./src/db/dbconnection.js";
import cookieParser from "cookie-parser";
import authRoutes from "./src/routes/authRoutes.js"
import cors from "cors"

connectDB(); 

const app = express();
app.use(cors({
    origin: 'http://localhost:5173', // your frontend
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);

app.get("/",(req,res)=>{
    console.log(req.headers)
    res.send("hi")
})
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
