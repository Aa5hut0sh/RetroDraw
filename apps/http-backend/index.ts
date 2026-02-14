import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route";
import wsRoutes from "./routes/ws.route";
dotenv.config();


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin:"*"
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/auth" , authRouter );
app.use("/api/ws" , wsRoutes );

app.listen(PORT , ()=>{
    console.log(`App is listening on PORT = ${PORT}`);
});