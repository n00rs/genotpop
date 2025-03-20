
import type { Request, Response, NextFunction } from "express"; // Import types from 'express'
import { jwtVerify, jwtDecode } from "../common/jwt.ts"; // Import your JWT functions
import { getPgConnection } from "../../config/index.ts"; // Import your database connection
import { ErrorHandler } from "../common/index.ts"; // Import your error handler

/**
 * Extract the access token from headers
 */

const getAccessToken = ({ objHeaders }: { objHeaders: any }) :string =>{
   
    const strAcctoken = objHeaders["authorization"] || objHeaders["x-access-token"];
    
    if (!strAcctoken) {
        throw { statusCode: 401, message: "NO_TOKEN_NO_AUTHORISATION" };
      }

    const strToken =
      strAcctoken.startsWith("Bearer") && strAcctoken.split(" ")?.[1]?.trim();
  
    if (!strToken) {
      throw { statusCode: 401, message: "INVALID_TOKEN_FORMAT" };
    }
    
    return strToken;

};

/**
 * Authentication middleware
 */

export const authenticateMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    try {
        
    // Step 1: Extract the token from headers

    const strToken = getAccessToken({ objHeaders: req.headers });
    
   // Step 2: Decode the token to get the intUserId

    const decodedToken = jwtDecode(strToken);
    const intUserId = decodedToken?.intUserId;

    if (!intUserId) {
        throw { statusCode: 401, message: "INVALID_TOKEN" };
      }
    
    // Step 3: Fetch the public key from the database

    const objConnectionPool = await getPgConnection({ blnPool: true });
    const strQuery = `
      SELECT vchr_acc_public_key 
      FROM tbl_user 
      WHERE pk_bint_user_id = $1 AND chr_document_status = 'N'
    `;
    const { rows } = await objConnectionPool.query(strQuery, [intUserId]);

    if (!rows.length) {
      throw { statusCode: 404, message: "USER_NOT_FOUND" };
    }
    
    const strPublicKey = rows[0].vchr_acc_public_key;

    // Step 4: Verify the token using the public key

        try {
            jwtVerify({ strToken, strPublicKey });
          } catch (err) {
            if (err.name === "TokenExpiredError") {
              throw { statusCode: 403, message: "REVOKED_TOKEN_PROVIDED" };
            } else {
              throw { statusCode: 401, message: "INVALID_TOKEN" };
            }
          }
         
    // Step 5: Attach the intUserId to the req object

        req.intUserId = intUserId;    
        
    // Step 6: Call next() to proceed to the next middleware or route handler

    next();
        
    } catch (error) {
    // Handle errors

    next(new ErrorHandler(error.message, error.statusCode || 500, error));
    }

}