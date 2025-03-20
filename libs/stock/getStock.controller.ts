import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/expCallback.ts";

export const getStockController = async ({
  body,
}: Parameters<TcreateStockController>[0]): ReturnType<TcreateStockController> => {
  try {
    const { strStockCode, strStockName } = body;
    const objConnectionPool = await getPgConnection({ blnPool: true });

    // Base query
    let strQuery = `SELECT * FROM tbl_stock WHERE chr_document_status = 'N'`;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (strStockCode) {
      strQuery += ` AND vchr_stock_code = $${paramIndex}`;
      queryParams.push(strStockCode);
      paramIndex++;
    }

    if (strStockName) {
      strQuery += ` AND vchr_stock_name = $${paramIndex}`;
      queryParams.push(strStockName);
    }

    const { rows } = await objConnectionPool.query(strQuery, queryParams);

    return { data: rows, intStatusCode: 200 };
  } catch (error) {
    throw new ErrorHandler(error);
  }
};

/**
 * @description Type definitions for stock controller
 */
export type TobjCreateStockBody = {
  strStockCode?: string;
  strStockName?: string;
  intUserId: number;
};

export type TcreateStockController = (
  objParams: TobjParams<TobjCreateStockBody>
) => Promise<TobjRes<{ data: any[]; intStatusCode: number }>>;
