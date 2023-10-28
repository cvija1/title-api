import * as dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDB } from "./config/db.js";
//import { userRoute } from "./routes/userRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
//import { messageRoute } from "./routes/messageRoutes.js";
//import { conversationRoute } from "./routes/conversationRoutes.js";

dotenv.config();

connectDB();

const app = express();
app.use(cors());
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

// app.use("/api/users", userRoute);
// app.use("/api/message", messageRoute);
// app.use("/api/conversation", conversationRoute);

app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(`Express app listening on port ${port}`);
});
