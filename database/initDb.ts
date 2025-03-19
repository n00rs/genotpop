import getPgConnection from "../config/postgres.ts";
import fs from "fs";
import path from "path";
import process  from "process";

process.loadEnvFile(".env")
const executeSQLFile = async () => {
  // Get a PostgreSQL connection objConnectionPool  
  const objConnectionPool = await getPgConnection({ blnPool: true });

  try {
    const __dirname = path.resolve("database", "initialize", "dbDefinition.sql");  
    const sqlQueries = fs.readFileSync(__dirname, "utf-8");
    // Execute SQL queries
    await objConnectionPool.query(sqlQueries);

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error executing SQL file:", error);
  } finally {
    await objConnectionPool.end();
  }
};

// Run the function
executeSQLFile().then(() => process.exit());
