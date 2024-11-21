import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL || "");
        console.log("MongoDB connected succesfully");
    } catch (error) {
        console.log("Error connecting to mongoDB: ", error);
        process.exit(1);
    }
};

export default connectDB;
