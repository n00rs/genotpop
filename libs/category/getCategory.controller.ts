import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/common.model.ts";

export const getStockCategoryController = async ({
  body,
}: TobjParams<TobjGetCategoryBody>): Promise<TobjRes<{ data: any[]; intStatusCode: number }>> => {
  let client;
  try {
    const { strCategoryCode, strCategoryName } = body;
    const objConnectionPool = await getPgConnection({ blnPool: true });
    client = await objConnectionPool.connect(); // Get client from pool

    const rows = await buildSelectQuery(client, strCategoryCode, strCategoryName);

    return { data: rows, intStatusCode: 200 };
  } catch (error) {
    throw new ErrorHandler(error);
  } finally {
    if (client) client.release(); // Ensure the client is released
  }
};

/**
 * @description Type definitions for category controller
 */
export type TobjGetCategoryBody = {
  strCategoryCode?: string;
  strCategoryName?: string;
};

export type TgetStockCategoryController = (
  objParams: TobjParams<TobjGetCategoryBody>
) => Promise<TobjRes<{ data: any[]; intStatusCode: number }>>;

async function buildSelectQuery(client, strCategoryCode?: string, strCategoryName?: string) {
  let strQuery = `
    SELECT 
      vchr_category_code AS "strCategoryCode",
      vchr_category_name AS "strCategoryName",
      pk_bint_category_id AS "intCategoryId"
    FROM tbl_category
    WHERE chr_document_status = 'N'`;
  
  const queryParams: any[] = [];
  
  if (strCategoryCode) {
    strQuery += ` AND vchr_category_code = $${queryParams.length + 1}`;
    queryParams.push(strCategoryCode);
  }

  if (strCategoryName) {
    strQuery += ` AND vchr_category_name = $${queryParams.length + 1}`;
    queryParams.push(strCategoryName);
  }
  
  const result = await client.query(strQuery, queryParams);
  return result.rows; // Return the actual data
}
