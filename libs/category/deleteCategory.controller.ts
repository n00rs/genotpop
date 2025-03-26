import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/common.model.ts";

export const deleteStockCategoryController = async ({
  body,
}: TobjParams<{ intCategoryId: number }>): Promise<TobjRes<{ strMessage: string }>> => {
  let client;
  try {
    const { intCategoryId } = body;
    if (!intCategoryId) throw new ErrorHandler("KEY_MISSING_CATEGORY_ID");

    const objConnectionPool = await getPgConnection({ blnPool: true });
    client = await objConnectionPool.connect(); // Acquire a connection

    await client.query("BEGIN"); // Start Transaction
    const rowCount = await buildDeleteQuery(client, intCategoryId);
    await client.query("COMMIT"); // Commit Transaction

    if (rowCount === 0) {
      throw new ErrorHandler("CATEGORY_NOT_FOUND_OR_ALREADY_DELETED");
    }

    return { strMessage: "CATEGORY_DELETED_SUCCESSFULLY", intStatusCode: 200 };
  } catch (error) {
    if (client) await client.query("ROLLBACK"); // Rollback Transaction on Error
    throw new ErrorHandler(error.message || "CATEGORY_DELETION_FAILED");
  } finally {
    if (client) client.release(); // Release the connection
  }
};

async function buildDeleteQuery(client, intCategoryId: number): Promise<number> {
  // Check if category exists
  const categoryCheckQuery = `SELECT pk_bint_category_id FROM tbl_category WHERE pk_bint_category_id = $1`;
  const categoryCheckResult = await client.query(categoryCheckQuery, [intCategoryId]);

  if ((categoryCheckResult?.rowCount ?? 0) === 0) {
    throw new ErrorHandler("CATEGORY_NOT_FOUND");
  }

  // Check if stock is used in sales
  const salesCheckQuery = `
    SELECT 1 FROM tbl_sales_master_details 
    WHERE fk_bint_category_id = $1 AND chr_document_status = 'N' LIMIT 1
  `;
  const salesCheckResult = await client.query(salesCheckQuery, [intCategoryId]);

  if ((salesCheckResult?.rowCount ?? 0) > 0) {
    throw new ErrorHandler("CATEGORY_CANNOT_BE_DELETED_USED_IN_SALES");
  }

  // Check if stock is used in inventory
  const inventoryCheckQuery = `
    SELECT 1 FROM tbl_inventory 
    WHERE fk_bint_category_id = $1 AND chr_document_status = 'N' LIMIT 1
  `;
  const inventoryCheckResult = await client.query(inventoryCheckQuery, [intCategoryId]);

  if ((inventoryCheckResult?.rowCount ?? 0) > 0) {
    throw new ErrorHandler("CATEGORY_CANNOT_BE_DELETED_USED_IN_INVENTORY");
  }

  // Soft delete category by updating status to 'D'
  const strQuery = `UPDATE tbl_category SET chr_document_status = 'D' WHERE pk_bint_category_id = $1`;
  const result = await client.query(strQuery, [intCategoryId]);

  return result.rowCount; // Return the number of affected rows
}
