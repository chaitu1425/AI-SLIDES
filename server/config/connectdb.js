import mongoose from "mongoose";

const connectdb = async()=>{
    try {
        const conn = await mongoose.connect(process.env.DBURL)
        console.log(`connected to database: ${conn.connection.host}`)
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectdb