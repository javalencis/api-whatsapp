import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(
            "mongodb://mongo:kHkrVGgGSauLrANBmmEjUTLAWGUTtLsS@mongodb.railway.internal:27017"
        );
        console.log("MongoDB connected succesfully");
    } catch (error) {
        console.log("Error connecting to mongoDB: ", error);
        process.exit(1);
    }
};

export default connectDB;
