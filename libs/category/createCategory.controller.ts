import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/expCallback.ts";

export const createStockCategoryController = async ({
  body,
  ...source
}: TobjParams<TobjCreateCategoryBody>): Promise<TobjRes<{ strMessage: string; intCategoryId: number }>> => {
  let client;
  try {
    const { strCategoryCode, strCategoryName } = body;
    // const { intUserId } = source;
    let intUserId = 3; // Hardcoded for now

    // Validate input
    if (!strCategoryCode) throw new ErrorHandler("KEY_MISSING_CATEGORY_CODE");
    if (!strCategoryName) throw new ErrorHandler("KEY_MISSING_CATEGORY_NAME");
    if (!intUserId) throw new ErrorHandler("KEY_MISSING_USER_ID");

    const objConnectionPool = await getPgConnection({ blnPool: true });
    client = await objConnectionPool.connect(); // Acquire a client from the pool

    const rows = await buildInsertQuery(client, strCategoryCode, strCategoryName, intUserId);

    if (!rows || rows.length === 0) {
      throw new ErrorHandler("CATEGORY_CREATION_FAILED");
    }

    return {
      strMessage: "CATEGORY_CREATED_SUCCESSFULLY",
      intCategoryId: rows[0].pk_bint_category_id,
    };
  } catch (err) {
    throw new ErrorHandler(err.message || "CATEGORY_CREATION_FAILED");
  } finally {
    if (client) client.release(); // Ensure client is released
  }
};

/**
 * @description Type definitions for category controller
 */
export type TobjCreateCategoryBody = {
  strCategoryCode: string;
  strCategoryName: string;
};

export type TcreateStockCategoryController = (
  objParams: TobjParams<TobjCreateCategoryBody>
) => Promise<TobjRes<{ strMessage: string; intCategoryId: number }>>;

async function buildInsertQuery(client, strCategoryCode: string, strCategoryName: string, intUserId: number) {
  const strQuery = `
    INSERT INTO tbl_category (
      vchr_category_code, vchr_category_name, fk_bint_created_id
    ) VALUES ($1, $2, $3) RETURNING pk_bint_category_id`;

  const { rows } = await client.query(strQuery, [strCategoryCode, strCategoryName, intUserId]);
  return rows;
}
