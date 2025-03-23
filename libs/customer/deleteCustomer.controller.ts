import type { QueryResult } from "pg";
import getPgConnection from "../../config/postgres.ts";
import ErrorHandler from "../common/errorHandler.ts";
import type {
  TcheckCustomerReference,
  TdeleteCustomerController,
  TupdateCustomerStatus,
} from "./customer.model.ts";
/**
 * This function deletes a customer by updating their status to 'D' (Deleted).
 * It performs the following steps:
 * 1. Validates the input customer ID.
 * 2. Checks if the customer is referenced in any inventory documents.
 * 3. Updates the customer's status to 'D' if no references are found.
 * 4. Returns a success message if the operation is successful.
 * 
 * @param param0 - An object containing the request body and additional metadata.
 * @returns An object with a success message and HTTP status code.
 */
export const deleteCustomerController: TdeleteCustomerController = async ({
  body,
  ...source
}) => {
  try {
    // Extract the customer ID from the request body
    const { intCustomerId } = body;

    // Validate if the customer ID is provided
    if (!intCustomerId) throw new ErrorHandler("KEY_MISSING_CUSTOMER_ID");

    // Validate if the customer ID is a valid integer
    if (isNaN(+intCustomerId))
      throw new ErrorHandler("CUSTOMER_ID_SHOULD_BE_TYPE_INTEGER");

    // Check if the customer is referenced in any inventory documents
    const arrDocumentNo = await checkCustomerReference({
      arrCustomerId: [intCustomerId],
    });

    // If references are found, throw an error indicating the customer cannot be deleted
    if (arrDocumentNo?.length)
      throw new ErrorHandler(
        "CUSTOMER_CANNOT_BE_DELETED_USED_IN_INVENTORY",
        409,
        arrDocumentNo
      );

    // Update the customer's status to 'D' (Deleted)
    const blnStatusUpdate = await updateCustomerStatus({
      arrCustomerId: [intCustomerId],
      strStatus: "D",
      intUserId: source.intUserId,
      timeStamp: source.timeStamp,
    });

    // Log the status of the update operation
    console.log(blnStatusUpdate);

    // If the status update failed, throw an error indicating the customer was not found or already deleted
    if (!blnStatusUpdate) throw new ErrorHandler("CUSTOMER_NOT_FOUND_OR_ALREADY_DELETED");

    // Return a success message and HTTP status code
    return {
      strMessage: "CUSTOMER_DELETED_SUCCESSFULLY",
      intStatusCode: 200,
    };
  } catch (err) {
    throw new ErrorHandler(err);
  }
};
/**
 * This function checks if a customer is referenced in any inventory documents.
 * It performs the following steps:
 * 1. Validates the input customer ID array.
 * 2. Queries the database to find any references to the customer in sales documents.
 * 3. Returns an array of document numbers if references are found.
 * 
 * @param param0 - An object containing an array of customer IDs.
 * @returns An array of document numbers where the customer is referenced.
 */
const checkCustomerReference: TcheckCustomerReference = async ({
    arrCustomerId,
}) => {
    try {
        // Ensure the customer ID array is not empty
        if (!arrCustomerId.length)
            throw new ErrorHandler("KEY_MISSING_CUSTOMER_ID");

        // SQL query to find document numbers referencing the customer
        const strQuery = ` SELECT ARRAY_AGG(tsm.vchr_document_number) AS "arrDocumentNo" 
                                                FROM tbl_sales_master tsm 
                                                WHERE tsm.chr_document_status = 'N' AND fk_bint_customer_id = ANY($1) `;

        // Get a connection from the PostgreSQL connection pool
        const objConnectionPool = await getPgConnection({ blnPool: true });

        // Execute the query and retrieve the result
        const { rows }: QueryResult<{ arrDocumentNo: string[] }> =
            await objConnectionPool.query(strQuery, [arrCustomerId]);

        // Return the array of document numbers, if any
        return rows[0]?.arrDocumentNo;
    } catch (err) {
        // Handle any errors that occur during the process
        throw new ErrorHandler(err);
    }
};

/**
 * @description This function updates the status of a customer in the database.
 * It performs the following steps:
 * 1. Validates the input parameters, including customer ID array and user ID.
 * 2. Executes an SQL query to update the customer's status, modified user ID, and modified timestamp.
 * 3. Returns a boolean indicating whether the update was successful.
 * 
 * @param param0 - An object containing the customer ID array, status, user ID, and timestamp.
 * @returns A boolean value: true if the update was successful, false otherwise.
 */
const updateCustomerStatus: TupdateCustomerStatus = async ({
    arrCustomerId,
    strStatus = "D",
    intUserId,
    timeStamp,
}) => {
    // Check if the customer ID array is empty and throw an error if it is
    if (!arrCustomerId.length) throw new ErrorHandler("KEY_MISSING_CUSTOMER_ID");

    // Check if the user ID is missing and throw an error if it is
    if (!intUserId) throw new ErrorHandler("KEY_MISSING_USER_ID");

    // Get a connection from the PostgreSQL connection pool
    const objConnection = await getPgConnection({ blnPool: true });

    try {
        // SQL query to update the customer's status, modified user ID, and modified timestamp
        const strQuery = ` UPDATE tbl_customer
                                             SET chr_document_status = $1,
                                             fk_bint_modified_id = $2,
                                             dat_modified = $3
                                             WHERE chr_document_status = 'N' AND kupk_bint_customer_id = ANY($4) `;

        // Execute the query with the provided parameters and retrieve the number of affected rows
        const { rowCount } = await objConnection.query(strQuery, [
            strStatus?.trim(), // Trim the status string to remove any extra spaces
            intUserId,         // User ID of the person making the update
            timeStamp || "now ()", // Use the provided timestamp or the current time if not provided
            arrCustomerId,     // Array of customer IDs to update
        ]);

        // Return true if at least one row was updated, otherwise return false
        return rowCount !== 0;
    } catch (err) {
        // Handle any errors that occur during the query execution
        throw new ErrorHandler(err);
    }
};
