import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/expCallback.ts";

export const createStockController = async ({
  body,
  ...source
}: TobjParams<TobjCreateStockBody>): Promise<TobjRes<{ strMessage: string; intStockId: number }>> => {
  let client;
  try {
    const { strStockCode, strStockName } = body;
    let intUserId = 3; // Hardcoded for now

    // Validate input
    if (!strStockCode) throw new ErrorHandler("KEY_MISSING_STOCK_CODE");
    if (!strStockName) throw new ErrorHandler("KEY_MISSING_STOCK_NAME");
    if (!intUserId) throw new ErrorHandler("KEY_MISSING_USER_ID");

    const objConnectionPool = await getPgConnection({ blnPool: true });
    client = await objConnectionPool.connect(); // Acquire a client from the pool

    const rows = await buildInsertQuery(client, strStockCode, strStockName, intUserId);

    if (!rows || rows.length === 0) {
      throw new ErrorHandler("STOCK_CREATION_FAILED");
    }

    return {
      strMessage: "STOCK_CREATED_SUCCESSFULLY",
      intStockId: rows[0].pk_bint_stock_id,
    };
  } catch (err) {
    throw new ErrorHandler(err.message || "STOCK_CREATION_FAILED");
  } finally {
    if (client) client.release(); // Ensure client is released
  }
};

/**
 * @description Type definitions for stock controller
 */
export type TobjCreateStockBody = {
  strStockCode: string;
  strStockName: string;
};

export type TcreateStockController = (
  objParams: TobjParams<TobjCreateStockBody>
) => Promise<TobjRes<{ strMessage: string; intStockId: number }>>;

async function buildInsertQuery(client, strStockCode: string, strStockName: string, intUserId: number) {
  const strQuery = `
    INSERT INTO tbl_stock (
      vchr_stock_code, vchr_stock_name, fk_bint_created_id, fk_bint_modified_id
    ) VALUES ($1, $2, $3, $3) RETURNING pk_bint_stock_id`;

  const { rows } = await client.query(strQuery, [strStockCode, strStockName, intUserId]);
  return rows;
}