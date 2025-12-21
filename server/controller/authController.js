import User from "../models/User.js";
import gentoken from "./token.js";
import validator from "validator"
import bcrypt from "bcryptjs"


export const signUp = async (req,res)=>{
    try {
        const {name,email,password} = req.body;
        const userExist = await User.findOne({ email });
        if(userExist){
            return res.status(400).json({ message: "User Already exist"});
        }

        if(!validator.isEmail(email)){
            return res.status(400).json({ message: "Email is not valid" })
        }

        if(password.length<8){
            return res.status(400).json({message:"Enter a strong password"})
        }
        const hash = await bcrypt.hash(password,10)
        const user =  await User.create({
            name,email,password:hash
        })
        let token = await gentoken(user._id)
        res.cookie("token",token,{
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 1 * 24 * 60 * 60 * 1000
        })
        res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`signup error ${error}`})
    }
}

export const signIn = async(req,res)=>{
    try {
        const {email,password} = req.body
        let user = await User.find({email})
        if(!user){
            return res.status(400).json({message:"user not found"})
        }
        let isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Password Incorrect"})
        }
        let token = await gentoken(user._id)
        res.cookie("token",token,{
            httpOnly:true,
            secure:false,
            sameSite: "none",
            maxAge:1*24*60*60*1000
        })
        res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`signIn error ${error}`})
    }
}

export const signOut = async(req,res)=>{
    try {
        await res.clearCookie("token")
        res.status(201).json({message:"Logout Success"})
    } catch (error) {
        return res.status(500).json({message:`Logout error ${error}`})        
    }
}