import * as dotenv from "dotenv";

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";
import { titleRoute } from "./routes/titleRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import fileUpload from "express-fileupload";
//test
dotenv.config();

connectDB();

const app = express();
app.use(cors());
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 1000000,
  })
);

const port = process.env.PORT || 3030;

app.get("/", (req, res) => {
  res.send("Hello");
});

app.use("/api", titleRoute);

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});
