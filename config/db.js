import mongoose from "mongoose";
export const { db } = mongoose.connection;
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(
      "\x1b[36m%s\x1b[0m",
      `MongoDB Connected:${conn.connection.host}`
    );
  } catch (error) {
    console.log(`Error:${error.message}`);
    process.exit(1);
  }
};
