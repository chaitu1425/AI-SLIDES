import mongoose from "mongoose";

const connectdb = async()=>{
    try {
        await mongoose.connect(process.env.DBURL)
        console.log("connected to database")
    } catch (error) {
        console.log(error)
    }
}
export default connectdb