
import type { Request, Response, NextFunction } from "express"; // Import types from 'express'
import { jwtVerify, jwtDecode } from "../common/jwt.ts"; // Import your JWT functions
import { getPgConnection } from "../../config/index.ts"; // Import your database connection
import { ErrorHandler } from "../common/index.ts"; // Import your error handler

/**
 * Extract the access token from headers
 */

const getAccessToken = ({ objHeaders }: { objHeaders: Request["headers"] }) :string =>{
  
  const strAcctoken = objHeaders["authorization"] || objHeaders["x-access-token"];
    
    if (!strAcctoken) {
        throw new ErrorHandler("NO_TOKEN_NO_AUTHORISATION",401)
      }

    const strToken =
      typeof strAcctoken === 'string' && strAcctoken.startsWith("Bearer") && strAcctoken.split(" ")?.[1]?.trim();
  
    if (!strToken) {
      throw new ErrorHandler("INVALID_TOKEN_FORMAT",401)
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
      throw new ErrorHandler("INVALID_TOKEN",401)
      }
    
    // Step 3: Fetch the public key from the database


    const strPublicKey = await getAccPubKeyByUserId(intUserId);

    // Step 4: Verify the token using the public key

        try {
            jwtVerify({ strToken, strPublicKey });
          } catch (err) {
            if (err.name === "TokenExpiredError") {
              throw new ErrorHandler("REVOKED_TOKEN_PROVIDED",403);      
            } else {
              throw new ErrorHandler("INVALID_TOKEN",401);      
            }
          }
         
    // Step 5: Attach the intUserId to the req object

        req["intUserId"] = intUserId;    
        
    // Step 6: Call next() to proceed to the next middleware or route handler

    next();
        
    } catch (error) {      
      if (error instanceof ErrorHandler) {
        res.statusCode = error.statusCode;
        res.send(error.objDetails);
      } else {
        res.statusCode = error.statusCode || 400;
        res.send("SOMETHING_WENT_WRONG");
      }
    }

}

/**
 * Retrieves the public key associated with a given user ID from the database.
 *
 * @param intUserId - The user ID for which the public key is to be fetched.
 * @returns The public key as a string.
 * @throws {ErrorHandler} If the user is not found or the database query fails.
 */
async function getAccPubKeyByUserId(intUserId) {
  const objConnectionPool = await getPgConnection({ blnPool: true });
  const strQuery = `
    SELECT vchr_acc_public_key 
    FROM tbl_user 
    WHERE pk_bint_user_id = $1 AND chr_document_status = 'N'
  `;
  const { rows } = await objConnectionPool.query(strQuery, [intUserId]);

  if (!rows.length) {
    throw new ErrorHandler("USER_NOT_FOUND",401)      
  }
  
  return rows[0].vchr_acc_public_key;
}