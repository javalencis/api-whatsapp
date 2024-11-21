import { model, Schema } from "mongoose";

const userSchema = new Schema(
    {
        orderId: {
            type: String,
            require: true,
        },
        phone: {
            type: String,
            require: true,
        },
    },
    {
        timestamps: true,
    }
);

export default model("User", userSchema);
