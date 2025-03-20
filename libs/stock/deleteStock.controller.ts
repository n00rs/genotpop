import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/expCallback.ts";

export const deleteStockController = async ({
  body,
}: TobjParams<{ intStockId: number }>): Promise<TobjRes<{ strMessage: string }>> => {
  try {
    const { intStockId } = body;
    if (!intStockId) throw new ErrorHandler("KEY_MISSING_STOCK_ID");

    const objConnectionPool = await getPgConnection({ blnPool: true });
    const strQuery = `UPDATE tbl_stock SET chr_document_status = 'D' WHERE pk_bint_stock_id = $1`;
    await objConnectionPool.query(strQuery, [intStockId]);

    return { strMessage: "STOCK_DELETED_SUCCESSFULLY", intStatusCode: 200 };
  } catch (error) {
    throw new ErrorHandler(error);
  }
};
