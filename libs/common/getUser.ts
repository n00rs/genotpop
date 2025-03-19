import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler} from "../common/index.ts";
import type { QueryResult } from "pg";
/**
 * @description Function to fetch user details by email
 * @param strEmail
 * @returns User details
 * @throws ErrorHandler
 */
export async function getUserDetailsByEmail(strEmail: string) {
    try {
      if (!strEmail) throw new ErrorHandler("KEY_MISSING_EMAIL");
      // Get a connection pool
      const objConnectionPool = await getPgConnection({ blnPool: true });
      // Query to fetch user details by email
      const strQuery = `
        SELECT 
          pk_bint_user_id AS "intUserId",
          vchr_email AS "strEmail",
          vchr_password AS "strPassword",
          vchr_role AS "strRole",
          vchr_acc_private_key AS "strAccPrivateKey",
          vchr_refr_private_key AS "strRefrPrivateKey"
        FROM tbl_user 
        WHERE vchr_email = $1 AND chr_document_status = 'N'
      `;
      const { rows }: QueryResult<{
        intUserId: number;
        strEmail: string;
        strPassword: string;
        strRole: string;
        strAccPrivateKey: string;
        strRefrPrivateKey: string;
      }> = await objConnectionPool.query(strQuery, [strEmail]);
      // Return user details
      return rows[0];
    } catch (error) {
      throw new ErrorHandler(error);
    }
  }