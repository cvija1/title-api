import asyncHandler from "express-async-handler";
import srtParser2 from "srt-parser-2";
import fs from "fs";
import { Movie } from "../models/movieModel.js";
import mongoose from "mongoose";

var parser = new srtParser2();
export const parseFile = asyncHandler(async (req, res) => {
  console.log(req.files);
  const fileOneKey = Object.keys(req.files)[0];
  const fileTwoKey = Object.keys(req.files)[1];

  const file1 = req.files[fileOneKey].data.toString("utf8");
  const file2 = req.files[fileTwoKey].data.toString("utf8");
  const title = req.files[fileOneKey].name;
  const srt_array1 = parser.fromSrt(file1);
  const srt_array2 = parser.fromSrt(file2);
  const merged_array = [...srt_array1, ...srt_array2].reduce(
    (result, currentObject) => {
      const index = result.findIndex((item) => item.id === currentObject.id);

      if (index === -1) {
        // Object with this ID doesn't exist in the result array; add it.
        result.push(currentObject);
      } else {
        // Object with this ID already exists; merge the properties.
        result[index] = {
          ...result[index],
          text2: currentObject.text,
          text3: "",
        };
      }

      return result;
    },
    []
  );

  const movie = await Movie.create({
    title,
    status: 0,
    subs: merged_array,
  });
  if (movie) {
    res.status(201).json({ movieId: movie._id, sub: merged_array[0] });
  } else {
    res.status(400);
    throw new Error("Nesto nije kako treba");
  }
});

export const editSub = asyncHandler(async (req, res) => {
  const movieId = req.params.movieId;
  const { subId, text } = req.body;
  const movie = await Movie.findOneAndUpdate(
    { _id: movieId, "subs.id": subId },
    {
      $set: {
        "subs.$.text3": text,
      },
    }
  );

  if (movie) {
    const nextSub = await Movie.findOne(
      { _id: new mongoose.Types.ObjectId(movieId) },
      {
        subs: {
          $elemMatch: { id: String(Number(subId) + 1) },
        },
      }
    );

    if (nextSub && nextSub.subs.length > 0) {
      const element = nextSub.subs[0];
      res.status(201).json({ movieId, sub: element });
    } else {
      const updatedMovie = await Movie.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(movieId) },
        { status: 1 },
        { new: true } // Set to true to return the updated document
      );

      if (updatedMovie) {
        res.status(201).json({
          movieId: updatedMovie._id,
          status: updatedMovie.status,
        });
      }
    }
  }
});

export const downloadSub = asyncHandler(async (req, res) => {
  const movieId = req.params.movieId;
  const status = req.query.status;

  if (Number(status) !== 1) {
    res.status(400);
    throw new Error("Film nije u potpunosti preveden");
  }
  const movie = await Movie.find(
    { _id: new mongoose.Types.ObjectId(movieId), status: Number(status) },
    { subs: 1, title: 1, _id: 0 }
  );

  const subs = movie[0].subs;
  const movieName = movie[0].title;
  subs.forEach((sub) => {
    delete sub["text"];
    delete sub["text2"];
    sub["text"] = sub["text3"];
    delete sub["text3"];
  });

  const srt_string = parser.toSrt(subs);

  res.setHeader("Content-Disposition", `attachment; filename="${movieName}"`);

  res.type("text/srt").send(srt_string);

  // const filePath = `${movieName}.srt`;

  // // Write the SRT string to a file
  // fs.writeFile(filePath, srt_string, (err) => {
  //   if (err) {
  //     console.error("Error writing SRT file:", err);
  //   } else {
  //     console.log("SRT file created successfully.");
  //   }
  // });
});
