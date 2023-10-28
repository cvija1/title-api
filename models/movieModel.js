import mongoose from "mongoose";

const movieSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    subs: {
      type: Array,
    },
  },
  { timestamps: true }
);

export const Movie = mongoose.model("Movie", movieSchema);
