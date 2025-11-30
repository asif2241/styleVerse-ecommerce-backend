/* eslint-disable @typescript-eslint/no-explicit-any */
import app from "./app"
import { Server } from "http"
import { envVars } from "./app/config/env";
import mongoose from "mongoose";
import { seedSuperAdmin } from "./app/utils/seedSuperAdmin";
// import { connectRedis } from "./app/config/redis.config";

let server: Server;

const startServer = async () => {
    try {

        await mongoose.connect(envVars.DB_URL);
        console.log("connected to DB!");

        server = app.listen(envVars.PORT, () => {
            console.log(`Server is listening on port 5000`);
        })
    } catch (err) {
        console.log(err);
    }

}

(async () => {
    await startServer()
    await seedSuperAdmin()
})()

process.on("SIGTERM", () => {
    console.log("SIGTERM signal recieved.... Server shutting down...");
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})

process.on("SIGINT", () => {
    console.log("SIGINT signal received.... Server shutting down....");

    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})
process.on("unhandledRejection", (err) => {
    console.log("unhandledRejection detected.... Server shutting down....", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})
process.on("uncaughtException", (err) => {
    console.log("uncaughtException detected.... Server shutting down....", err);

    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})


