import type { QueryResult } from "pg";
import { ErrorHandler } from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/common.model.ts";
import { jwtDecode, jwtSign, jwtVerify } from "../common/jwt.ts";
import getPgConnection from "../../config/postgres.ts";
/**
 * Controller function to handle the refresh token process.
 * It validates the provided access and refresh tokens, verifies the refresh token
 * using the public key retrieved from the database, and generates a new access token.
 *
 * @async
 * @function
 * @param {Parameters<TrefreshTokenController>[0]} params - The input parameters containing the request body and other source data.
 * @param {object} params.body - The request body containing the tokens.
 * @param {string} params.body.strAccessToken - The access token to be validated.
 * @param {string} params.body.strRefreshToken - The refresh token to be validated and used for generating a new access token.
 * @returns {Promise<TobjRes<{ strAccessToken: string }>>} A promise that resolves to an object containing the newly generated access token.
 * @throws {ErrorHandler} Throws an error if any of the following conditions are met:
 * - Missing access token or refresh token.
 * - Invalid access token or refresh token.
 * - Token verification fails.
 * - User not found in the database.
 * - Token is expired or revoked.
 */

const refreshTokenController = async ({
  body,
  ...source
}: Parameters<TrefreshTokenController>[0]): ReturnType<TrefreshTokenController> => {
  try {
    let { strAccessToken, strRefreshToken } = body;

    // Check or validate params
    if (!strAccessToken) throw new ErrorHandler("KEY_MISSING_ACCESS_TOKEN");
    if (!strRefreshToken) throw new ErrorHandler("KEY_MISSING_REFRESH_TOKEN");

    const objAccessPayload = jwtDecode(strAccessToken);
    if (!objAccessPayload?.intUserId)
      throw new ErrorHandler("INVALID_ACCESS_TOKEN");

    // get public key from db and verify the refresh token
    const { strAccPrivateKey, strRefrPublicKey } = await getPubKeyByUserId(
      objAccessPayload.intUserId
    );
    if (!strRefrPublicKey) throw new ErrorHandler("INVALID_ACCESS_TOKEN");

    // verify refresh token
    const objPayload = jwtVerify({
      strToken: strRefreshToken,
      strPublicKey: strRefrPublicKey,
    });
    if (!objPayload) throw new ErrorHandler("INVALID_TOKEN");
    // create new acess token
    strAccessToken = jwtSign({
      objPayload: {
        intUserId: objPayload.intUserId,
        strEmail: objPayload.strEmail,
        strRole: objPayload.strRole,
      },
      strType: "ACCESS",
      strPrivateKey: strAccPrivateKey,
    });

    return { strAccessToken };
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new ErrorHandler("REVOKED_TOKEN_PROVIDED", 403);
    }
    if (err.name === "JsonWebTokenError")
      throw new ErrorHandler("INVALID_REFRESH_TOKEN", 401);

    throw new ErrorHandler(err);
  }
};

export type TrefreshTokenController = (
  objParams: TobjParams<{ strAccessToken: string; strRefreshToken: string }>
) => Promise<TobjRes<{ strAccessToken: string }>>;

export { refreshTokenController };
/**
 *
 * @param intUserId
 * @returns {{Promise<{
 * strAccPrivateKey: string;
 * strRefrPublicKey: string;
 * }>}}
 */
async function getPubKeyByUserId(intUserId: number): Promise<{
  strAccPrivateKey: string;
  strRefrPublicKey: string;
}> {
  const objConnectionPool = await getPgConnection({ blnPool: true });
  const strQuery = `
    SELECT 
    vchr_refr_public_key AS "strRefrPublicKey",
    vchr_acc_private_key AS "strAccPrivateKey"
    FROM tbl_user 
    WHERE pk_bint_user_id = $1 AND chr_document_status = 'N'
  `;
  const {
    rows,
  }: QueryResult<{ strRefrPublicKey: string; strAccPrivateKey: string }> =
    await objConnectionPool.query(strQuery, [intUserId]);

  if (!rows.length) {
    throw new ErrorHandler("USER_NOT_FOUND", 401);
  }

  return {
    strAccPrivateKey: rows[0].strAccPrivateKey,
    strRefrPublicKey: rows[0]?.strRefrPublicKey,
  };
}
