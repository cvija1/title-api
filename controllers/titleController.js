import asyncHandler from "express-async-handler";
import srtParser2 from "srt-parser-2";
import { Movie } from "../models/movieModel.js";
import mongoose from "mongoose";

var parser = new srtParser2();
export const parseFile = asyncHandler(async (req, res) => {
  const file1 = req.files.undefined[0].data.toString("utf8");
  const file2 = req.files.undefined[1].data.toString("utf8");
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
    title: "test",
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
  const { subId, text, movieId } = req.body;
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
