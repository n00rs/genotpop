import {
  ErrorHandler,
  comparePassword,
  getUserDetailsByEmail,
} from "../common/index.ts";
import { jwtSign } from "../common/jwt.ts";
import type { TobjParams, TobjRes } from "../common/common.model.ts";

export const loginController = async ({
  body,
  ...source
}: Parameters<TloginController>[0]): ReturnType<TloginController> => {
  try {
    const { strEmail, strPassword } = body;

    // Check if required keys are present in the request body
    if (!strEmail) throw new ErrorHandler("KEY_MISSING_EMAIL");
    if (!strPassword) throw new ErrorHandler("KEY_MISSING_PASSWORD");

    // Fetch user details by email
    const objUserDetails = await getUserDetailsByEmail(strEmail);

    if (!objUserDetails) throw new ErrorHandler("USER_NOT_FOUND");

    // Compare the provided password with the hashed password
    const isPasswordValid = await comparePassword(strPassword, objUserDetails?.strPassword);

    if (!isPasswordValid) throw new ErrorHandler("INVALID_PASSWORD");

    // Create token payload
    const objTokenPayload = {
      intUserId: objUserDetails?.intUserId,
      strEmail: objUserDetails?.strEmail,
      strRole: objUserDetails?.strRole,
    };

    // Generate JWT tokens
    const strAccessToken = jwtSign({
      objPayload: objTokenPayload,
      strType: "ACCESS",
      strPrivateKey: objUserDetails?.strAccPrivateKey,
    });

    const strRefreshToken = jwtSign({
      objPayload: objTokenPayload,
      strType: "REFRESH",
      strPrivateKey: objUserDetails?.strRefrPrivateKey,
    });

    return {
      strMessage: "LOGIN_SUCCESS",
      strEmail: objUserDetails?.strEmail,
      intUserId: objUserDetails?.intUserId,
      strRefreshToken,
      strAccessToken,
    };
  } catch (err) {
    throw new ErrorHandler(err);
  }
};

/**
 * @description Type definitions for login controller
 */
export type TobjLoginBody = {
  strEmail: string;
  strPassword: string;
};

export type TloginController = (
  objParams: TobjParams<TobjLoginBody>
) => Promise<
  TobjRes<{
    strEmail: string;
    intUserId: number;
    strRefreshToken: string;
    strAccessToken: string;
  }>
>;
