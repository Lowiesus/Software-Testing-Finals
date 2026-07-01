import mongodb from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new mongodb.MongoClient(process.env.MONGODB_URI);
const dbName = process.env.MONGODB_NAME || "hackaton2026";

let db = null;

export const connectToDatabase = async () => {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log("connected to database:", dbName);
  } catch (error) {
    console.error("Failed to connect to the database", error);
    process.exit(1);
  }
};

export const getDB = () => {
  if (!db) {
    throw new Error("Database not connected. Call connectToDatabase first.");
  }
  return db;
};

export const getCollection = (collectionName) => {
  return getDB().collection(collectionName);
};

export default {
  connectToDatabase,
  getDB,
  getCollection,
};
