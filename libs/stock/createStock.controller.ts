import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/expCallback.ts";

export const createStockController = async ({
  body,
  ...source
}: Parameters<TcreateStockController>[0]): ReturnType<TcreateStockController> => {
  try {
    const { strStockCode, strStockName, intUserId } = body;

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
    
    return {
      strMessage: "STOCK_CREATED_SUCCESSFULLY",
      intStockId: rows[0].pk_bint_stock_id,
    };
  } catch (err) {
    throw new ErrorHandler(err);
  }
};

/**
 * @description Type definitions for stock controller
 */
export type TobjCreateStockBody = {
  strStockCode: string;
  strStockName: string;
  intUserId: number;
};

export type TcreateStockController = (
  objParams: TobjParams<TobjCreateStockBody>
) => Promise<TobjRes<{ strMessage: string; intStockId: number }>>;
