import type { QueryResult } from "pg";
import { getPgConnection } from "../../config/index.ts";
import { ErrorHandler } from "../common/index.ts";
import type {
  TcreateCustomerController,
  TobjCreateBody,
} from "./customer.model.ts";

/**
 * Controller to handle the creation of a new customer.
 * Validates the input data, processes the request, and interacts with the database to insert a new customer record.
 * 
 * @param {TcreateCustomerController} param0 - Object containing the request body and source information.
 * @returns {Promise<{ intCustomerId: number; strMessage: string }>} - Returns the ID of the newly created customer and a success message.
 * @throws {ErrorHandler} - Throws an error if validation fails or database insertion encounters an issue.
 */
export const createCustomerController: TcreateCustomerController = async ({
  body,
  ...source
}) => {
  try {
    const {
      strCustomerCode,
      strCustomerName,
      strPhone,
      dblDiscountPercent = 0,
      dblOutStanding = 0,
      strAddress = "",
      strEmail = "",
      strGstAddress = "",
      strGstNo = "",
    } = body;

    const { intUserId } = source;
    const arrError: string[] = [];
    if (!strCustomerCode?.trim()) arrError.push("KEY_MISSING_CUSTOMER_CODE");
    if (!strCustomerName?.trim()) arrError.push("KEY_MISSING_CUSTOMER_NAME");
    if (!strPhone?.trim()) arrError.push("KEY_MISSING_PHONE");
    if (isNaN(+dblOutStanding)) arrError.push("INVALID_OUTSTANDING_AMOUNT");
    if (isNaN(+dblDiscountPercent))
      arrError.push("INVALID_DISCOUNT_PERCENTAGE");
    if (strAddress?.trim()?.length > 5000)
      arrError.push("ADDRESS_LENGTH_SHOULD_BE_LESS_THAN_5000");
    if (strGstNo && strGstNo?.trim()?.length !== 15)
      arrError.push("GST_NUMBER_LENGTH_SHOULD_EQUAL_TO_15");
    if (strGstAddress?.trim()?.length > 5000)
      arrError.push("GST_ADDRESS_LENGTH_SHOULD_BE_LESS_THAN_100");
    if (arrError.length) throw new ErrorHandler("ERROR", 400, arrError);

    const intCustomerId = await createCustomerDb({
      strCustomerCode: strCustomerCode.trim(),
      strCustomerName: strCustomerName.trim(),
      strPhone: strPhone.trim(),
      strEmail: strEmail?.trim(),
      strAddress: strAddress?.trim(),
      dblDiscountPercent: +dblDiscountPercent,
      strGstNo: strGstNo?.trim(),
      strGstAddress: strGstAddress?.trim(),
      dblOutStanding: +dblOutStanding,
      intUserId,
    });

    return { intCustomerId, strMessage: "CUSTOMER_CREATED_SUCCESSFULLY" };
  } catch (err) {
    throw new ErrorHandler(err);
  }
};
/**
 * Inserts a new customer record into the database.
 * 
 * @param {TobjCreateBody & { intUserId: number }} param0 - Object containing customer details and the ID of the user creating the record.
 * @returns {Promise<number>} - Returns the ID of the newly created customer.
 * @throws {ErrorHandler} - Throws an error if database constraints are violated or insertion fails.
 */
async function createCustomerDb({
  strCustomerCode,
  strCustomerName,
  strPhone,
  strEmail,
  strAddress,
  dblDiscountPercent,
  strGstNo,
  strGstAddress,
  dblOutStanding,
  intUserId,
}: TobjCreateBody & { intUserId: number }): Promise<number> {
  try {
    const strQuery = `
    INSERT INTO tbl_customer(
    vchr_customer_code,
    vchr_customer_name,
    vchr_phone,
    vchr_email,
    vchr_address,
    dbl_discount_percent,
    vchr_gst_no,
    vchr_gst_address,
    dbl_outstanding,
    fk_bint_created_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING pk_bint_customer_id AS "intCustomerId"
    `;

    const arrParams = [
      strCustomerCode,
      strCustomerName,
      strPhone,
      strEmail || null,
      strAddress,
      dblDiscountPercent,
      strGstNo || null,
      strGstAddress,
      dblOutStanding,
      intUserId,
    ];
    const objConnectionPool = await getPgConnection({ blnPool: false });
    const { rows, rowCount }: QueryResult<{ intCustomerId: number }> =
      await objConnectionPool.query(strQuery, arrParams);
    //   if insertion failed
    if (rowCount === 0)
      throw new ErrorHandler("INSERTING_CUSTOMER_DATA_FAILED");

    // if (typeof rows[0]?.intCustomerId === "number")
    return +rows[0]?.intCustomerId;
    // else return 0
  } catch (err) {
    switch (err.constraint) {
      case "tbl_customer_vchr_customer_code_key":
        throw new ErrorHandler("CUSTOMER_CODE_DUPLICATE", 400, {
          strCustomerCode,
        });
      case "tbl_customer_vchr_phone_key":
        throw new ErrorHandler("CUSTOMER_PHONE_DUPLICATE", 400, { strPhone });
      case "tbl_customer_vchr_gst_no_key":
        throw new ErrorHandler("CUSTOMER_GST_NO_DUPLICATE", 400, { strGstNo });
      case "tbl_customer_vchr_email_key":
        throw new ErrorHandler("CUSTOMER_EMAIL_DUPLICATE", 400, { strEmail });

      default:
        throw new ErrorHandler("INSERTING_CUSTOMER_DATA_FAILED");
    }
  }
}
