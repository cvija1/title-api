import express from "express";
import {
  downloadSub,
  editSub,
  parseFile,
} from "../controllers/titleController.js";

const router = express.Router();

router.post("/upload", parseFile);
router.put("/edit/:movieId", editSub);
router.get("/download/:movieId", downloadSub);

export { router as titleRoute };
