import { MongoClient } from "mongodb";

/**
 * Establishes a connection to a MongoDB database and returns the database instance.
 *
 * @param {Object} param0 - The configuration object.
 * @param {string} [param0.strDbName=""] - The name of the database to connect to. If not provided, defaults to the value of `process.env.MONGODATABASE`.
 * @param {string} [param0.strUri=""] - The MongoDB connection URI. If not provided, it falls back to `process.env.MONGOURL`.
 * @returns {Promise<import("mongodb").Db>} - A promise that resolves to the MongoDB database instance.
 * @throws {Error} - Throws an error if the connection fails.
 */
export default async function getMongoConnection({
  strDbName = "",
  strUri = "",
} = {}) {
  try {
    // If no URI is provided, attempt to retrieve it from environment variables.
    if (!strUri && typeof process.env.MONGOURL === "string")
      strUri = strUri || process.env.MONGOURL;
    // Create a new MongoDB client instance.
    const mongoClient = new MongoClient(strUri, {
      maxIdleTimeMS: Number(process.env.PGTIMEOUT),
    });
    await mongoClient.connect();
    // Select the database, falling back to the environment variable if needed.
    const db = mongoClient.db(strDbName || process.env.MONGODATABASE);
    return db;
  } catch (err) {
    throw new Error(err);
  }
}
