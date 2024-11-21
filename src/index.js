import express from "express";
import router from "./routes/routes.js";
import connectDB from "./db.js";

async function startServer() {
    await connectDB();
    const app = express();
    app.use(express.json());
    app.use("/", router);

    app.listen(3000, () => {
        console.log("Servidor escuchando en 3000");
    });
}

startServer();
