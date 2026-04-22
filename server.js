import express from "express";
import cors from "cors";
import connectDB from "./configs/db.js";
import dotenv from 'dotenv/config.js';
import userRouter from "./routers/userRoute.js";
import resumeRouter from "./routers/resumeRoutes.js";
import aiRouter from "./routers/aiRoutes.js";

const app=express();


const PORT =process.env.PORT || 3000;


//connection database

// await connectDB();

let connected=false;

const connectWithRetry = async () => {
    try {
        await connectDB();
        connected=true;
        console.log('Connected to the database successfully!');
    } catch (error) {
        console.error('Failed to connect to the database. Retrying in 5 seconds...', error);
        setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    }

};

app.use((req, res, next) => {
    if (!connected) {
        connectWithRetry();
    }
    next();
});

app.use(express.json())
app.use(cors())

app.get('/',(req,res)=>res.send("Server is live.."))

app.use('/api/users',userRouter)
app.use('/api/resumes',resumeRouter)
app.use('/api/ai',aiRouter)

// app.listen(PORT,()=>{
//     console.log(`Server is running on port ${PORT}`);
// });

module.exports = app;