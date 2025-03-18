import { getPgConnection } from "../../config/index.ts";
import {
  ErrorHandler,
  comparePassword,
} from "../common/index.ts";
import { jwtSign } from "../common/jwt.ts"; 
import type { TobjParams, TobjRes } from "../common/expCallback.ts";
import type { QueryResult } from "pg";


export const loginController = async ({
  body,
  ...source
}: Parameters<TloginController>[0]): 
ReturnType<TloginController> => {
  try {
    const { strEmail, strPassword } = body;

    // Check if required keys are present in the request body
    if (!strEmail) throw new ErrorHandler("KEY_MISSING_EMAIL");
    if (!strPassword) throw new ErrorHandler("KEY_MISSING_PASSWORD");

    // Fetch user details by email
    const user = await getUserDetailsByEmail(strEmail);

    if (!user) throw new ErrorHandler("USER_NOT_FOUND");

    // Compare the provided password with the hashed password
    const isPasswordValid = await comparePassword(strPassword, user.strPassword);

    if (!isPasswordValid) throw new ErrorHandler("INVALID_PASSWORD");

    // Create token payload
    const tokenPayload = {
      intUserId: user.intUserId,
      strEmail: user.strEmail,
      strRole: user.strRole,
    };

    // Generate JWT tokens
    const accessToken = jwtSign({
        objPayload: tokenPayload,
        strType: "ACCESS",
        strPrivateKey: user.strAccPrivateKey,
      });
      
      const refreshToken = jwtSign({
        objPayload: tokenPayload,
        strType: "REFRESH",
        strPrivateKey: user.strRefrPrivateKey,
      });

    return {
      strMessage: "LOGIN_SUCCESS",
      strEmail: user.strEmail,
      intUserId: user.intUserId,
      refreshToken,
      accessToken,
    };
  } catch (err) {
    throw new ErrorHandler(err);
  }
};

/**
 * @description Function to fetch user details by email
 * @param strEmail
 * @returns User details
 * @throws ErrorHandler
 */
async function getUserDetailsByEmail(strEmail: string) {
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

/**
 * @description Type definitions for login controller
 */
export type TobjLoginBody = {
  strEmail: string;
  strPassword: string;
};

export type TloginController = (
  objParams: TobjParams<TobjLoginBody>
) => Promise<TobjRes<{
  strEmail: string;
  intUserId: number;
  refreshToken: string;
  accessToken: string;
}>>;