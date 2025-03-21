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

    // Check if stock exist or not
    const stockCheckQuery = `SELECT pk_bint_stock_id FROM tbl_stock WHERE pk_bint_stock_id = $1`;
    const stockCheckResult = await objConnectionPool.query(stockCheckQuery, [intStockId]);

    if ((stockCheckResult?.rowCount ?? 0) === 0) {
      throw new ErrorHandler("STOCK_NOT_FOUND");
    }

    // Check if stock is linked in tbl_sales_master_details with active status
    const salesCheckQuery = `
      SELECT 1 FROM tbl_sales_master_details 
      WHERE fk_bint_stock_id = $1 AND chr_document_status = 'N' LIMIT 1
    `;
    const salesCheckResult = await objConnectionPool.query(salesCheckQuery, [intStockId]);

    if ((salesCheckResult?.rowCount ?? 0) > 0) {
      throw new ErrorHandler("STOCK_CANNOT_BE_DELETED_USED_IN_SALES");
    }

    // Check if stock is linked in tbl_inventory with active status
    const inventoryCheckQuery = `
      SELECT 1 FROM tbl_inventory 
      WHERE fk_stock_id = $1 AND chr_document_status = 'N' LIMIT 1
    `;
    const inventoryCheckResult = await objConnectionPool.query(inventoryCheckQuery, [intStockId]);

    if ((inventoryCheckResult?.rowCount ?? 0) > 0) {
      throw new ErrorHandler("STOCK_CANNOT_BE_DELETED_USED_IN_INVENTORY");
    }

    // Delete stock (update status to 'D' )
    const strQuery = `UPDATE tbl_stock SET chr_document_status = 'D' WHERE pk_bint_stock_id = $1`;
    await objConnectionPool.query(strQuery, [intStockId]);

    return { strMessage: "STOCK_DELETED_SUCCESSFULLY", intStatusCode: 200 };
  } catch (error) {
    throw new ErrorHandler(error.message || "STOCK_DELETION_FAILED");
  }
};
