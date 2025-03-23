import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/common.model.ts";

export const deleteStockController = async ({
  body,
}: TobjParams<{ intStockId: number }>): Promise<TobjRes<{ strMessage: string }>> => {
  let client;
  try {
    const { intStockId } = body;
    if (!intStockId) throw new ErrorHandler("KEY_MISSING_STOCK_ID");

    const objConnectionPool = await getPgConnection({ blnPool: true });
    client = await objConnectionPool.connect(); // Acquire a connection

    await client.query("BEGIN"); // Start Transaction
    const rowCount = await buildDeleteQuery(client, intStockId);
    await client.query("COMMIT"); // Commit Transaction

    if (rowCount === 0) {
      throw new ErrorHandler("STOCK_NOT_FOUND_OR_ALREADY_DELETED");
    }

    return { strMessage: "STOCK_DELETED_SUCCESSFULLY", intStatusCode: 200 };
  } catch (error) {
    if (client) await client.query("ROLLBACK"); // Rollback Transaction on Error
    throw new ErrorHandler(error.message || "STOCK_DELETION_FAILED");
  } finally {
    if (client) client.release(); // Release the connection
  }
};

async function buildDeleteQuery(client, intStockId: number): Promise<number> {
  // Check if stock exists
  const stockCheckQuery = `SELECT pk_bint_stock_id FROM tbl_stock WHERE pk_bint_stock_id = $1`;
  const stockCheckResult = await client.query(stockCheckQuery, [intStockId]);

  if ((stockCheckResult?.rowCount ?? 0) === 0) {
    throw new ErrorHandler("STOCK_NOT_FOUND");
  }

  // Check if stock is used in sales
  const salesCheckQuery = `
    SELECT 1 FROM tbl_sales_master_details 
    WHERE fk_bint_stock_id = $1 AND chr_document_status = 'N' LIMIT 1
  `;
  const salesCheckResult = await client.query(salesCheckQuery, [intStockId]);

  if ((salesCheckResult?.rowCount ?? 0) > 0) {
    throw new ErrorHandler("STOCK_CANNOT_BE_DELETED_USED_IN_SALES");
  }

  // Check if stock is used in inventory
  const inventoryCheckQuery = `
    SELECT 1 FROM tbl_inventory 
    WHERE fk_bint_stock_id = $1 AND chr_document_status = 'N' LIMIT 1
  `;
  const inventoryCheckResult = await client.query(inventoryCheckQuery, [intStockId]);

  if ((inventoryCheckResult?.rowCount ?? 0) > 0) {
    throw new ErrorHandler("STOCK_CANNOT_BE_DELETED_USED_IN_INVENTORY");
  }

  // Soft delete stock by updating status to 'D'
  const strQuery = `UPDATE tbl_stock SET chr_document_status = 'D' WHERE pk_bint_stock_id = $1`;
  const result = await client.query(strQuery, [intStockId]);

  return result.rowCount; // Return the number of affected rows
}
