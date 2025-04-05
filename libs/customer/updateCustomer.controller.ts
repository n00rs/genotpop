import { ErrorHandler } from "../common/index.ts";
import { getCustomerList } from "./getCustomer.controller.ts";
import type { TupdateCustomerController, TupdateCustomerDb } from "./customer.model.ts";
import getPgConnection from "../../config/postgres.ts";
/**
 * @description This function updates customer details in the database. It first validates the input data,
 * checks for any errors, and ensures the customer exists and has not been modified since the provided timestamp.
 * If all validations pass, it updates the customer details in the database and logs the changes.
 * 
 * @param {Object} param0 - The input object containing the request body and source metadata.
 * @param {Object} param0.body - The request body containing customer details to be updated.
 * @param {string} param0.body.datModified - The last modified timestamp of the customer.
 * @param {string} param0.body.strEmail - The email address of the customer.
 * @param {string} param0.body.strPhone - The phone number of the customer.
 * @param {string} param0.body.strModifiedBy - The user who modified the customer.
 * @param {number} param0.body.intCustomerId - The unique ID of the customer.
 * @param {string} param0.body.strAddress - The address of the customer.
 * @param {string} param0.body.strGstAddress - The GST address of the customer.
 * @param {string} param0.body.strGstNo - The GST number of the customer.
 * @param {number} param0.body.dblDiscountPercent - The discount percentage for the customer.
 * @param {Object} source - Metadata about the request, including timestamp and user ID.
 * @param {string} source.timeStamp - The current timestamp of the operation.
 * @param {number} source.intUserId - The ID of the user performing the operation.
 * 
 * @returns {Promise<Object>} - Returns an object containing the customer ID and a success message.
 * 
 * @throws {ErrorHandler} - Throws an error if validation fails, the customer does not exist, or the update fails.
 */

export const updateCustomerController: TupdateCustomerController = async ({
  body,
  ...source
}) => {
  try {
    // Destructure the required fields from the request body and source metadata
    const {
      datModified,
      strEmail,
      strPhone,
      intCustomerId,
      strAddress,
      strGstAddress,
      strGstNo,
      dblDiscountPercent,
    } = body;
    const { timeStamp, intUserId } = source;

    // Initialize an array to collect validation errors
    const arrError: string[] = [];

    // Validate required fields and add errors to the array if validation fails
    if (!intCustomerId) arrError.push("KEY_MISSING_CUSTOMER_PK");
    if (!strPhone?.trim()) arrError.push("KEY_MISSING_PHONE");
    if (isNaN(+dblDiscountPercent))
      arrError.push("INVALID_DISCOUNT_PERCENTAGE");
    if (strAddress?.trim()?.length > 5000)
      arrError.push("ADDRESS_LENGTH_SHOULD_BE_LESS_THAN_5000");
    if (strGstNo && strGstNo?.trim()?.length !== 15)
      arrError.push("GST_NUMBER_LENGTH_SHOULD_EQUAL_TO_15");
    if (strGstAddress?.trim()?.length > 5000)
      arrError.push("GST_ADDRESS_LENGTH_SHOULD_BE_LESS_THAN_100");

    // If there are validation errors, throw an error with the collected errors
    if (arrError.length) throw new ErrorHandler("ERROR", 400, arrError);

    // Fetch the existing customer details from the database
    const objOldValues = (await getCustomerList({ intCustomerId }))?.[0];

    // If the customer does not exist, throw an error
    if (!objOldValues) throw new ErrorHandler("INVALID_CUSTOMER");

    // Check if the customer has been modified since the provided timestamp
    if (new Date(objOldValues.datModified).getTime() != new Date(datModified).getTime())
      throw new ErrorHandler("ALREADY_MODIFIED");

    // Update the customer details in the database
    await updateCustomerDb({
      dblDiscountPercent: +dblDiscountPercent,
      intCustomerId,
      intUserId,
      strAddress: strAddress?.trim(),
      strEmail: strEmail?.trim() || "",
      strGstAddress: strGstAddress?.trim(),
      strGstNo: strGstNo?.trim(),
      strPhone: strPhone?.trim(),
      timeStamp,
    });

    // Return a success message with the customer ID
    return { intCustomerId, strMessage: "UPDATED_SUCCESSFULLY" };
  } catch (error) {
    throw new ErrorHandler(error);
  }
};





/**
 * @description This function updates customer details in the database. It first logs the current state of the customer
 * in the database for auditing purposes and then updates the customer record with the new details.
 * 
 * @param {Object} param0 - The input object containing customer details and metadata for the update operation.
 * @param {string} param0.timeStamp - The current timestamp of the operation.
 * @param {number} param0.intUserId - The ID of the user performing the operation.
 * @param {number} param0.intCustomerId - The unique ID of the customer to be updated.
 * @param {string} param0.strPhone - The updated phone number of the customer.
 * @param {string} param0.strEmail - The updated email address of the customer.
 * @param {string} param0.strAddress - The updated address of the customer.
 * @param {number} param0.dblDiscountPercent - The updated discount percentage for the customer.
 * @param {string} param0.strGstNo - The updated GST number of the customer.
 * @param {string} param0.strGstAddress - The updated GST address of the customer.
 * 
 * @returns {Promise<boolean>} - Returns true if the update operation is successful.
 * 
 * @throws {ErrorHandler} - Throws an error if the logging or update operation fails.
 */
const updateCustomerDb: TupdateCustomerDb = async ({
  timeStamp,
  intUserId,
  intCustomerId,
  strPhone,
  strEmail,
  strAddress,
  dblDiscountPercent,
  strGstNo,
  strGstAddress,
}) => {
  const objConnectionPool = await getPgConnection({ blnPool: false });
  try {
    // Query to log the current state of the customer in the database for auditing purposes
    const strQuery = `INSERT INTO tbl_customer(
      vchr_customer_code,
      vchr_customer_name,
      vchr_phone,
      vchr_email,
      vchr_address,
      dbl_discount_percent,
      vchr_gst_no,
      vchr_gst_address,
      dbl_outstanding,
      dat_created,
      dat_modified,
      fk_bint_created_id,
      fk_bint_modified_id,
      chr_document_status
      )
      SELECT 
        vchr_customer_code,
        vchr_customer_name,
        vchr_phone,
        vchr_email,
        vchr_address,
        dbl_discount_percent,
        vchr_gst_no,
        vchr_gst_address,
        dbl_outstanding,
        dat_created,
        $1,
        fk_bint_created_id,
        $2,
        $3
      FROM tbl_customer WHERE pk_bint_customer_id = $4 `;
    await objConnectionPool.query("BEGIN");
    const { rowCount } = await objConnectionPool.query(strQuery, [
      timeStamp,
      intUserId,
      "M",
      intCustomerId,
    ]);

    // If no rows are affected, throw an error indicating the logging operation failed
    if (rowCount === 0)
      throw new ErrorHandler("INVALID_CUSTOMER", 400, {
        str: "INSERTION_FOR_LOG_FAILED",
      });

    // Query to update the customer details in the database
    const strUpdateQuery = ` UPDATE tbl_customer 
                                  SET
                                  vchr_phone = $1,
                                  vchr_email = $2,
                                  vchr_address = $3,
                                  dbl_discount_percent = $4,
                                  vchr_gst_no = $5,
                                  vchr_gst_address = $6,
                                  fk_bint_modified_id = $7,
                                  dat_modified = $8
                                  WHERE pk_bint_customer_id = $9 
                                  AND chr_document_status = 'N';`;
    let { rowCount: intUpdateCount } = await objConnectionPool.query(
      strUpdateQuery,
      [
        strPhone,
        strEmail,
        strAddress,
        dblDiscountPercent,
        strGstNo,
        strGstAddress,
        intUserId,
        timeStamp,
        intCustomerId,
      ]
    );

    // If no rows are affected, throw an error indicating the update operation failed
    if (intUpdateCount === 0)
      throw new ErrorHandler("INVALID_CUSTOMER", 400, {
        str: "UPDATING_CUSTOMER_TABLE_FAILED",
      });

    // Commit the transaction if all operations are successful
    await objConnectionPool.query("COMMIT");

    return true;
  } catch (err) {
    // Rollback the transaction in case of any errors
    await objConnectionPool.query("ROLLBACK");
    throw new ErrorHandler(err);
  }
};
