import express from "express";
import { editSub, parseFile } from "../controllers/titleController.js";

const router = express.Router();

router.post("/upload", parseFile);
router.put("/edit", editSub);

export { router as titleRoute };
