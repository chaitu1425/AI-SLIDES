import User from "../models/User.js";
import gentoken from "./token.js";
import validator from "validator"
import bcrypt from "bcryptjs"

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000
};

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Email is not valid" });
        }
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hash });
        const token = await gentoken(user._id);
        res.cookie("token", token, COOKIE_OPTIONS);
        res.status(200).json({ _id: user._id, name: user.name, email: user.email });
    } catch (error) {
        return res.status(500).json({ message: `Signup error: ${error.message}` });
    }
};

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }
        const token = await gentoken(user._id);
        res.cookie("token", token, COOKIE_OPTIONS);
        res.status(200).json({ _id: user._id, name: user.name, email: user.email });
    } catch (error) {
        return res.status(500).json({ message: `SignIn error: ${error.message}` });
    }
};

export const signOut = async (req, res) => {
    try {
        res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        return res.status(500).json({ message: `Logout error: ${error.message}` });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `Error: ${error.message}` });
    }
};