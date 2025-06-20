import express, { urlencoded } from 'express';  
import cors from 'cors';    
import cookieParser from 'cookie-parser';
import dotenv from "dotenv";
import connectDB from './utils/db.js';// here we are using db.js not just db, because db.js is in utils folder
import userRoute from './routes/user.route.js';
// and we are importing userRoute from routes folder, not just user, because user is in routes folder
dotenv.config({});
const app = express();  

const PORT = process.env.PORT || 3000; // Use environment variable or default to 5000   

app.get("/", (_, res) => {
    return res.status(200).json({
         message: 'Hello from the server!',
         success: true
        })
})

// middlewares 
app.use(express.json());
app.use(cookieParser());// Parse cookies from the request headers
app.use(urlencoded({ extended: true }));
const corsOptions = {   
    origin: 'http://localhost:5173', // Replace with your React app's URL
    credentials: true, // Allow credentials (cookies) to be sent    
}
app.use(cors(corsOptions)); // Use CORS middleware with options 

// apis will be here 

app.use("/api/v1/user", userRoute);






app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});



