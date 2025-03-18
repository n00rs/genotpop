
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
  }): string => {
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
  export const jwtVerify = ({ strToken, strPublicKey }) =>
    jwt.verify(strToken, strPublicKey, { algorithm: ["RS256"] });
  
  /**
   *
   * @param strToken
   * @returns {Object} payload from token
   */
  export const jwtDecode = (strToken) => jwt.decode(strToken);