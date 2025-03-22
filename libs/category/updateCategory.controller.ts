import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/expCallback.ts";

export const updateStockCategoryController = async ({
  body,
  ...source
}: TobjParams<{ intCategoryId: number; strCategoryCode?: string; strCategoryName?: string; intUserId: number }>
): Promise<TobjRes<{ strMessage: string }>> => {
  let client;
  try {
    const { intCategoryId, strCategoryCode, strCategoryName } = body;
    // const { intUserId } = source;
    let intUserId = 3; // Hardcoded for now

    // Validate input
    if (!intCategoryId) throw new ErrorHandler("KEY_MISSING_CATEGORY_ID");
    if (!strCategoryCode) throw new ErrorHandler("KEY_MISSING_CATEGORY_CODE");
    if (!strCategoryName) throw new ErrorHandler("KEY_MISSING_CATEGORY_NAME");
    if (!intUserId) throw new ErrorHandler("KEY_MISSING_USER_ID");

    const objConnectionPool = await getPgConnection({ blnPool: true });
    client = await objConnectionPool.connect(); // Acquire a connection

    const rowCount = await buildUpdateQuery(client, strCategoryCode, strCategoryName, intUserId, intCategoryId);

    if (rowCount === 0) {
      throw new ErrorHandler("CATEGORY_UPDATE_FAILED_OR_NOT_FOUND");
    }

    return { strMessage: "CATEGORY_UPDATED_SUCCESSFULLY", intStatusCode: 200 };
  } catch (error) {
    throw new ErrorHandler(error.message || "CATEGORY_UPDATE_FAILED");
  } finally {
    if (client) client.release(); // Release the connection
  }
};

async function buildUpdateQuery(client, strCategoryCode: string, strCategoryName: string, intUserId: number, intCategoryId: number): Promise<number> {
  const strQuery = `
    UPDATE tbl_category 
    SET vchr_category_code = COALESCE($1, vchr_category_code), 
        vchr_category_name = COALESCE($2, vchr_category_name),
        fk_bint_modified_id = $3,
        dat_modified = now()
    WHERE pk_bint_category_id = $4
  `;
  
  const result = await client.query(strQuery, [strCategoryCode, strCategoryName, intUserId, intCategoryId]);
  return result.rowCount; // Return the number of updated rows
}
