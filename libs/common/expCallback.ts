import type { Request, Response, NextFunction } from "express";
import {ErrorHandler} from "./index.ts";

/**
 * Factory function to create an Express middleware callback.
 *
 * @param {TcontrollerFunc} controller - The controller function to handle the request.
 * @returns {Function} - Returns an Express middleware function.
 */
export default function expCallbackFactory<T>(controller: TcontrollerFunc<T>) {
  /**
   * Express middleware function that processes the request, extracts relevant data,
   * and invokes the controller function.
   *
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next function to pass control to the next middleware.
   */
  return async function expCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      console.log({
        originalUrl: req.originalUrl,
        url: req.url,
        baseUrl: req.baseUrl,
      });
      // Extract request parameters to be passed to the controller
      const objParams = {
        body: req.body,
        query: req.query,
        cookies: req.cookies,
        intUserId: req["intUserId"], // Custom property added to request from auth middle ware
        strMethod: req.method,
        objHeaders: {
          strUserAgent: req.headers["user-agent"],
          strToken: req.headers.authorization,
        },
        strOriginalUrl: req.originalUrl,
        strUrl: req.url,
        strBaseUrl: req.baseUrl,
        strIp: req.ip,
        strIps: req.ips,
        timeStamp: new Date(),
      };
      // Invoke the controller with extracted parameters
      const objRes = await controller(objParams);

      const objSuccessCode = {
        POST: "",
      };
      // Set response status code (default to 200 if not provided)
      res.statusCode = objRes?.intStatusCode || 200;
      res.send({ body: objRes });
    } catch (err) {
      console.log("---------", err, "---------");

      if (err instanceof ErrorHandler) {
        res.statusCode = err.statusCode;
        res.send(err.objDetails);
      } else {
        res.statusCode = err.statusCode || 400;
        res.send("SOMETHING_WENT_WRONG");
      }
    }
  };
}

interface Irequest extends Request {
  intUserId: number;
}
export type TobjParams<Body> = {
  body: Body;
  query: Request["query"];
  cookies: Request["cookies"];
  intUserId: number;
  strMethod: string;
  objHeaders: {
    strUserAgent: string | undefined;
    strToken: string | undefined;
  };
  strOriginalUrl: Request["originalUrl"];
  strUrl: Request["url"];
  strBaseUrl: Request["baseUrl"];
  strIp: Request["ip"];
  strIps: Request["ips"];
  timeStamp: Date;
};

export type TobjRes<Res> = {
  intStatusCode?: number;
  strMessage?: string;
} & Res;

export type TcontrollerFunc<Body = object, Res = object> = (
  objParams: TobjParams<Body>
) => Promise<TobjRes<Res>>;
