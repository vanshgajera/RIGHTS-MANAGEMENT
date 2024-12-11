import dotenv from "dotenv"
import connectDB from "./db/mongoose.js";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 7200, () => {
        console.log(` Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO db connection  failed !!!" , err);
})