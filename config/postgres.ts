import type { Client, Pool, ClientConfig } from "pg";
import pg from "pg";


/**
 * Establishes a connection to a PostgreSQL database using either a connection pool or a single client.
 *
 * @overload
 * @param {Object} objParams - The configuration object.
 * @param {boolean} objParams.blnPool - If `true`, returns a connection pool; if `false`, returns a single client connection.
 * @returns {Promise<Pool>} - A promise resolving to a PostgreSQL connection pool if `blnPool` is `true`.
 *
 * @overload
 * @param {Object} objParams - The configuration object.
 * @param {boolean} objParams.blnPool - If `true`, returns a connection pool; if `false`, returns a single client connection.
 * @returns {Promise<Client>} - A promise resolving to a single PostgreSQL client if `blnPool` is `false`.
 *
 * @param {string} [objParams.strDbName=""] - The name of the database to connect to. Defaults to `process.env.PGDATABASE`.
 * @param {string} [objParams.strHost=""] - The database host. Defaults to `process.env.PGHOST`.
 * @param {number|null} [objParams.strPort=null] - The database port. Defaults to `process.env.PGPORT`.
 * @param {boolean} [objParams.blnPool=false] - Determines whether to use a connection pool (`true`) or a single client (`false`).
 * @returns {Promise<Client | Pool>} - A promise that resolves to a `Client` or `Pool` instance depending on `blnPool`.
 * @throws {Error} - Throws an error if the connection fails.
 */
function getPgConnection(objParams: { blnPool: true }): Promise<Pool>;
function getPgConnection(objParams: { blnPool: false }): Promise<Client>;

async function getPgConnection({
  strDbName = "",
  strHost = "",
  strPort = null,
  blnPool = false,
} = {}): Promise<Client | Pool> {
  try {
    // Configure database connection options
    const objDbConfig: ClientConfig = {
      user: process.env.PGUSER, // Database username
      password: process.env.PGPASSWORD, // Database password
      host: strHost || process.env.PGHOST,// Host address (fallback to environment variable)
      port: strPort || Number(process.env.PGPORT),//Port number (fallback to environment variable)
      database: strDbName || process.env.PGDATABASE,// Database name (fallback to environment variable)
      idle_in_transaction_session_timeout: Number(process.env.PGTIMEOUT),// Timeout setting
    };
    if (blnPool) {
      // Return a connection pool if `blnPool` is true
      const connectionPool = new pg.Pool(objDbConfig);
      connectionPool.on('error',(err,client)=>{
        console.warn(err.message);
        // client.release(err)
      })
      return connectionPool;
    }

    // Return a single database client if `blnPool` is false
    const connectionClient = new pg.Client(objDbConfig);
    await connectionClient.connect()
    return connectionClient;
  } catch (err) {
    process.exit(1)
    // throw new Error(err);
  }
}
export default getPgConnection ;
