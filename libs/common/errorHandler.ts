/**
 * @description Custom Error Handler class to handle errors
 */
/**
 * @class ErrorHandler
 * @extends Error
 * @description Custom error handler class that extends the native Error class.
 *
 * @property {number} statusCode - HTTP status code associated with the error.
 * @property {object} objDetails - Additional details about the error.
 * @property {string | undefined} stack - Stack trace of the error.
 * @property {string} strErrName - Name of the error.
 *
 * @constructor
 * @param {string | Error} strMessage - Error message or an instance of Error.
 * @param {number} [intStatusCode=400] - HTTP status code, defaults to 400.
 * @param {object} [objDetails={}] - Additional details about the error.
 *
 * @example
 * // Creating an instance with a custom message
 * const error = new ErrorHandler("Custom error message", 404, { additional: "info" });
 *
 * @example
 * // Creating an instance with an Error object
 * const error = new ErrorHandler(new Error("Original error message"), 500);
 */
class ErrorHandler extends Error {
  /**
   * @description Constructor for ErrorHandler
   * @param strMessage Error message
   *
   */
  public statusCode: number;
  public objDetails: object;
  public stack: string | undefined = "";
  public name: string = "";

  constructor(
    strMessage: any = "SOMETHING_WENT_WRONG",
    statusCode: Response["status"] = 400,
    objDetails: object = {}
  ) {
    if (typeof strMessage === "object") {
      objDetails = {
        strReason: strMessage.message,
        name: strMessage.name,
        strCause: strMessage.cause,
        strMessage:
          objDetails?.["strMessage"] ||
          strMessage?.objDetails?.["strMessage"] ||
          "SOMETHING_WENT_WRONG",
        ...objDetails,
      };
    } else if (typeof strMessage === "string")
      Object.assign(objDetails, { strMessage });

    super(strMessage);
    this.stack = strMessage?.stack || this.stack;
    this.name = strMessage?.name || this.name;
    this.statusCode =
      strMessage?.statusCode || objDetails?.["statusCode"] || statusCode ;
    this.objDetails =  strMessage?.objDetails || this.objDetails || objDetails ;

    // Set the prototype explicitly to maintain the instance of ErrorHandler
    // Object.setPrototypeOf(this, ErrorHandler.prototype);
  }
}

export default ErrorHandler;
