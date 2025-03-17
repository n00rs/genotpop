import { getPgConnection } from "../../config/index.ts";
import {
  ErrorHandler,
  generatePubPrivKeyPair,
  hashPassword,
} from "../common/index.ts";
import type{ TobjParams, TobjRes } from "../common/expCallback.ts";
import type { QueryResult } from "pg";

const arrAllowedRoles = ["ADMIN", "SUPER_ADMIN", "USER"]; // Allowed roles
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email regex pattern for validation

export const signUpController = async ({
  body,
  ...source
}: Parameters<TsignUpController>[0]): 
ReturnType<TsignUpController> => {
  try {
    let {
      strEmail,
      strName,
      strPassword,
      strPhone,
      strRole,
      intUserId = null,
    } = body;

    // Check if required keys are present in the request body
    if (!strEmail) throw new ErrorHandler("KEY_MISSING_EMAIL");
    if (!strName) throw new ErrorHandler("KEY_MISSING_NAME");
    if (!strPassword) throw new ErrorHandler("KEY_MISSING_PASSWORD");
    if (!strRole) throw new ErrorHandler("KEY_MISSING_ROLE");

    // Check if the role is valid or not
    strRole = strRole.toUpperCase();
    if (!arrAllowedRoles.includes(strRole))
      throw new ErrorHandler("INVALID_ROLE", 403, { strRole });
    // Check if the email is valid
    strEmail = strEmail.trim();

    if (!emailRegex.test(strEmail)) throw new ErrorHandler("INVALID_EMAIL");

    // Check if the email is already registered
    const blnUser = await getUserByEmail(strEmail);

    if (blnUser) throw new ErrorHandler("EMAIL_ALREADY_REGISTERED");

    // hash the password
    const strHashedPassword = await hashPassword(strPassword);

    const objAccKeys = generatePubPrivKeyPair();
    const objRefrKeys = generatePubPrivKeyPair();
    // Create a new user
    const { intLoginId } = await createUSer({
      strEmail,
      strName,
      strPassword: strHashedPassword, // hashed password
      strPhone,
      strRole,
      intUserId,
      objAccKeys,
      objRefrKeys,
    });

    return { strMessage: "SIGN_UP_SUCCESS", intStatusCode: 201, intLoginId };
  } catch (err) {
    throw new ErrorHandler(err);
  }
};

/**
 * @description Function to check if the user is already registered
 * @param strEmail
 * @returns boolean
 * @throws ErrorHandler
 */
async function getUserByEmail(strEmail: string) {
  try {
    if (!strEmail) throw new ErrorHandler("KEY_MISSING_EMAIL");
    // Get a connection pool
    const objConnectionPool = await getPgConnection({ blnPool: true });
    // Query to check if the email is already registered
    const strQuery = `SELECT vchr_email FROM tbl_user WHERE vchr_email = $1 AND chr_document_status = 'N' `;
    const { rows } = await objConnectionPool.query(strQuery, [strEmail]);
    // Return true if the email is already registered
    return !!rows.length;
  } catch (error) {
    throw new ErrorHandler(error);
  }
}
/**
 * @description Function to create a new user
 * @param strEmail
 * @param strName
 * @param strPassword
 * @param strPhone
 * @param strRole
 * @param intUserId
 * @param objAccKeys  - Object containing account keys
 * @param objRefrKeys - Object containing refresh keys
 * @returns intLoginId
 * @throws ErrorHandler
 */
async function createUSer({
  strEmail,
  strName,
  strPassword,
  strPhone,
  strRole,
  intUserId,
  objAccKeys,
  objRefrKeys,
}: Parameters<TcreateUSer>[0]): ReturnType<TcreateUSer> {
  try {
    const arrParams = [
      strEmail,
      strName,
      strPassword,
      strPhone,
      strRole,
      intUserId,
      objAccKeys.strPrivateKey,
      objAccKeys.strPublicKey,
      objRefrKeys.strPrivateKey,
      objRefrKeys.strPublicKey,
    ];
    // Query to create a new user
    const strQuery = `INSERT INTO 
    tbl_user(vchr_email, vchr_name, vchr_password,
             vchr_phone, vchr_role, fk_bint_created_id, 
             vchr_acc_private_key, vchr_acc_public_key, 
             vchr_refr_private_key, vchr_refr_public_key) 
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING pk_bint_user_id AS "intLoginId" `;
    // Get a connection pool
    const objConnectionPool = await getPgConnection({ blnPool: true });
    const { rows, rowCount }: QueryResult<{ intLoginId: number }> =
      await objConnectionPool.query(strQuery, arrParams);
    if (rowCount !== 1) throw new ErrorHandler("ERROR_WHILE_CREATING_USER");
    return { intLoginId: rows[0]?.["intLoginId"] };
  } catch (err) {
    throw new ErrorHandler(err);
  }
}
/**
 *
 */
export type TobjSignUpBody = {
  strEmail: string;
  strPassword: string;
  strName: string;
  strRole: string;
  strPhone: string;
  intUserId?: number;
};
/**
 *
 */
export type TsignUpController = (
  objParams: TobjParams<TobjSignUpBody>
) => Promise<TobjRes<{ intLoginId: number }>>;

export type TcreateUSer = (objParams: {
  strEmail: string;
  strName: string;
  strPassword: string;
  strPhone: string;
  strRole: string;
  intUserId?: number | null;
  objAccKeys: {
    strPublicKey: string;
    strPrivateKey: string;
  };
  objRefrKeys: {
    strPublicKey: string;
    strPrivateKey: string;
  };
}) => Promise<{
  intLoginId: number;
}>;
