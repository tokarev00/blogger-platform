import express from "express";
import {setupApp} from "./setup-app";
import {runDb} from "./db/mongo-db";

const app = express();
setupApp(app);

const PORT = process.env.PORT || 3001;

const start = async () => {
    await runDb();
    app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}`);
    });
};

start();