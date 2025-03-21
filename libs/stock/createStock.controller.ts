import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/expCallback.ts";

export const createStockController = async ({
  body,
  ...source
}: TobjParams<TobjCreateStockBody>): Promise<TobjRes<{ strMessage: string; intStockId: number }>> => {
  try {
    const { strStockCode, strStockName } = body;
    const { intUserId } = source;

    // Validate input
    if (!strStockCode) throw new ErrorHandler("KEY_MISSING_STOCK_CODE");
    if (!strStockName) throw new ErrorHandler("KEY_MISSING_STOCK_NAME");
    if (!intUserId) throw new ErrorHandler("KEY_MISSING_USER_ID");

    const objConnectionPool = await getPgConnection({ blnPool: true });

    // Insert new stock
    const strQuery = `
      INSERT INTO tbl_stock (
        vchr_stock_code, vchr_stock_name, fk_bint_created_id, fk_bint_modified_id
      ) VALUES ($1, $2, $3, $3) RETURNING pk_bint_stock_id`;

    const { rows } = await objConnectionPool.query(strQuery, [
      strStockCode,
      strStockName,
      intUserId
    ]);

    if (!rows || rows.length === 0) {
      throw new ErrorHandler("STOCK_CREATION_FAILED");
    }

    return {
      strMessage: "STOCK_CREATED_SUCCESSFULLY",
      intStockId: rows[0].pk_bint_stock_id,
    };
  } catch (err) {
    throw new ErrorHandler(err.message || "STOCK_CREATION_FAILED");
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
