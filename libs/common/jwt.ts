import jwt from "jsonwebtoken";

/**
 *
 * @param param0
 * @returns {string} json web token for auth
 */
export const jwtSign = ({
  objPayload,
  strType = "ACCESS",
  strPrivateKey = "",
}: Parameters<TjwtSign>[0]): string => {
  //getting exp time of access and refr token
  const strExpTim =
    strType === "ACCESS"
      ? process.env.ACCESS_EXP_TIME
      : process.env.REFRESH_EXP_TIME;
  //creating  token

  return jwt.sign(objPayload, strPrivateKey, {
    // expiresIn:  "12h",
    algorithm: "RS256",
    expiresIn: strExpTim,
  });
};
/**
 * @param param0
 * @returns
 */
export const jwtVerify = ({ strToken, strPublicKey }): TokenPayload =>
  jwt.verify(strToken, strPublicKey, { algorithm: ["RS256"] });

/**
 *
 * @param strToken
 * @returns {Object} payload from token
 */

export const jwtDecode = (strToken: string): TokenPayload => {
  const decoded = jwt.decode(strToken);
  if (
    !decoded ||
    typeof decoded !== "object" ||
    !("intUserId" in decoded) ||
    !("strEmail" in decoded) ||
    !("strRole" in decoded)
  ) {
    throw new Error("Invalid token payload");
  }
  return decoded as TokenPayload;
};

export type TokenPayload = {
  intUserId: number;
  strEmail: string;
  strRole: string;
};

type TjwtSign = (objParams: {
  objPayload: TokenPayload;
  strType?: "ACCESS" | "REFRESH";
  strPrivateKey?: string;
}) => string;
