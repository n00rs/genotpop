import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/common.model.ts";

export const getStockController = async ({
  body,
}: TobjParams<TobjCreateStockBody>): Promise<TobjRes<{ data: any[]; intStatusCode: number }>> => {
  let client;
  try {
    const { strStockCode, strStockName } = body;
    const objConnectionPool = await getPgConnection({ blnPool: true });
    client = await objConnectionPool.connect(); // Get client from pool

    const { strQuery, queryParams } = buildSelectQuery(strStockCode, strStockName);
    const { rows } = await client.query(strQuery, queryParams);

    return { data: rows, intStatusCode: 200 };
  } catch (error) {
    throw new ErrorHandler(error);
  } finally {
    if (client) client.release(); // Ensure the client is released
  }
};

/**
 * @description Type definitions for stock controller
 */
export type TobjCreateStockBody = {
  strStockCode?: string;
  strStockName?: string;
};

export type TcreateStockController = (
  objParams: TobjParams<TobjCreateStockBody>
) => Promise<TobjRes<{ data: any[]; intStatusCode: number }>>;

function buildSelectQuery(strStockCode?: string, strStockName?: string) {

  let strQuery = `
    SELECT 
      vchr_stock_code AS "strStockCode",
      vchr_stock_name AS "strStockName",
      pk_bint_stock_id AS "intStockId"
    FROM tbl_stock
    WHERE chr_document_status = 'N'`;
  
  const queryParams: any[] = [];
  
  if (strStockCode) {
    strQuery += ` AND vchr_stock_code = $${queryParams.length + 1}`;
    queryParams.push(strStockCode);
  }

  if (strStockName) {
    strQuery += ` AND vchr_stock_name = $${queryParams.length + 1}`;
    queryParams.push(strStockName);
  }

  return { strQuery, queryParams };
}
