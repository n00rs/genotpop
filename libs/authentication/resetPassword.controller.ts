import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler, hashPassword, comparePassword, getUserDetailsByEmail,} from "../common/index.ts";
import type { TobjParams, TobjRes } from "../common/expCallback.ts";

/**
 * @description Reset password controller (by check and verifies old password)
 */
export const resetPasswordController = async ({
  body,
  ...source
}: Parameters<TresetPasswordController>[0]): ReturnType<TresetPasswordController> => {
  try {
    const { strEmail, strOldPassword, strNewPassword } = body;

    // check or validate params
    if (!strEmail) throw new ErrorHandler("KEY_MISSING_EMAIL");
    if (!strOldPassword) throw new ErrorHandler("KEY_MISSING_OLD_PASSWORD");
    if (!strNewPassword) throw new ErrorHandler("KEY_MISSING_NEW_PASSWORD");

    // Fetch user details by email
    const objUserDetails = await getUserDetailsByEmail(strEmail);
    if (!objUserDetails) throw new ErrorHandler("EMAIL_NOT_FOUND");

    // Compare old password and ne password
    const isOldPasswordValid = await comparePassword(strOldPassword, objUserDetails?.strPassword);
    if (!isOldPasswordValid) throw new ErrorHandler("INVALID_OLD_PASSWORD");

    // Hash new password
    const hashedNewPassword = await hashPassword(strNewPassword);

    // Update the password to the database
    await updatePassword(strEmail, hashedNewPassword);

    return { strMessage: "PASSWORD_RESET_SUCCESS", intStatusCode: 200 };
  } catch (err) {
    throw new ErrorHandler(err);
  }
};

/**
 * @description Function to update user's password
 * @param strEmail
 * @param strHashedPassword
 * @throws ErrorHandler
 */
async function updatePassword(strEmail: string, strHashedPassword: string) {
  try {
    const objConnectionPool = await getPgConnection({ blnPool: true });
    const strQuery = `UPDATE tbl_user SET vchr_password = $1 WHERE vchr_email = $2`;
    await objConnectionPool.query(strQuery, [strHashedPassword, strEmail]);
  } catch (error) {
    throw new ErrorHandler(error);
  }
}

/**
 * @description Type definitions for reset password controller
 */
export type TobjResetPasswordBody = {
  strEmail: string;
  strOldPassword: string;
  strNewPassword: string;
};

export type TresetPasswordController = (
  objParams: TobjParams<TobjResetPasswordBody>
) => Promise<TobjRes<{ strMessage: string }>>;
