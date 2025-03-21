import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/expCallback.ts";

export const updateStockController = async ({
  body,
  ...source
}: TobjParams<{ intStockId: number; strStockCode?: string; strStockName?: string; intUserId: number }>
): Promise<TobjRes<{ strMessage: string }>> => {
  try {
    const { intStockId, strStockCode, strStockName } = body;
    const { intUserId } = source;

    // Validate input
    if (!intStockId) throw new ErrorHandler("KEY_MISSING_STOCK_ID");
    if (!strStockCode) throw new ErrorHandler("KEY_MISSING_STOCK_CODE");
    if (!strStockName) throw new ErrorHandler("KEY_MISSING_STOCK_NAME");
    if (!intUserId) throw new ErrorHandler("KEY_MISSING_USER_ID");

    const objConnectionPool = await getPgConnection({ blnPool: true });
    const strQuery = `
      UPDATE tbl_stock 
      SET vchr_stock_code = COALESCE($1, vchr_stock_code), 
          vchr_stock_name = COALESCE($2, vchr_stock_name),
          fk_bint_modified_id = $3,
          dat_modified = now()
      WHERE pk_bint_stock_id = $4
    `;
    await objConnectionPool.query(strQuery, [strStockCode, strStockName, intUserId, intStockId]);

    return { strMessage: "STOCK_UPDATED_SUCCESSFULLY", intStatusCode: 200 };
  } catch (error) {
    throw new ErrorHandler(error);
  }
};
