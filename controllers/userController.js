import User from "../models/User.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Resume from "../models/Resume.js";

const generateToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
    return token;
}

// POST: /api/users/register
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Missing required feild " })
        }

        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ message: "user already  exist " })
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            name, email, password: hashedPassword
        })

        const token = generateToken(newUser._id)
        newUser.password = undefined;

        return res.status(201).json({ message: 'user Created succcessfully..', token, user: newUser })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// POST: /api/users/login
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" })
        }

        if (!user.comparePassword(password)) {
            return res.status(400).json({ message: "Invalid email or password" })
        }

        const token = generateToken(user._id)
        user.password = undefined;

        return res.status(200).json({ message: 'Login succcessfully..', token, user })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// GET: /api/users/data
export const getUserById = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }

        user.password = undefined;

        return res.status(200).json({ user })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// GET: /api/users/resumes
export const getUserResume = async (req, res) => {
    try {
        const userId = req.userId;
        const resumes = await Resume.find({ userId })
        return res.status(200).json({ resumes })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}
