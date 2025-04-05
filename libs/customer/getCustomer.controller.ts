import getPgConnection from "../../config/postgres.ts";
import ErrorHandler from "../common/errorHandler.ts";
import type {
  TgetCustomerController,
  TgetCustomerList,
  TqueryRes,
} from "./customer.model.ts";

/**
 * Controller function to handle customer retrieval requests.
 * It processes the request body, applies filters, pagination, and sorting,
 * and returns the list of customers along with metadata.
 *
 * @param param0 - Request object containing body, filters, pagination, and sorting details.
 * @returns Response object containing customer list, pagination, and sorting details.
 */
export const getCustomerController: TgetCustomerController = async ({
  body,
  ...source
}) => {
  try {
    const {
      objFilter: {
        intCustomerId = 0,
        strCustomerCode = "",
        strCustomerName = "",
        strEmail = "",
        blnBranch = false,
      } = {},
      objPagination: { intPageOffset = 0, intPerPage = 50 } = {},
      objSort: { strActive = "intCustomerId", strDirection = "ASC" } = {},
    } = body;

    // Fetch the customer list based on the provided filters, pagination, and sorting.
    const arrList = await getCustomerList({
      strCustomerCode: strCustomerCode?.trim(),
      strCustomerName: strCustomerName?.trim(),
      strEmail: strEmail?.trim(),
      intCustomerId: intCustomerId,
      strActive: strActive?.trim(),
      strDirection: strDirection?.trim(),
      intPageOffest: intPageOffset * intPerPage || 0,
      intPerPage: intPerPage || 50,
    });

    // Prepare the response object with the customer list and metadata.
    const objResponse: Awaited<ReturnType<TgetCustomerController>> = {
      objSort: {
        strActive,
        strDirection,
      },
      objPagination: {
        intPageOffset,
        intPerPage,
        intTotalCount: arrList?.[0]?.intTotalCount || 0,
      },
      arrList: arrList,
    };

    return objResponse;
  } catch (err) {
    // Handle errors using the custom error handler.
    throw new ErrorHandler(err);
  }
};

/**
 * Function to fetch the list of customers from the database.
 * It applies filters, sorting, and pagination to the query.
 *
 * @param param0 - Object containing filter, sorting, and pagination details.
 * @returns Array of customer records from the database.
 */
export const getCustomerList: TgetCustomerList = async ({
  strCustomerCode = "",
  strCustomerName = "",
  strEmail = "",
  intCustomerId = 0,
  strActive = "intCustomerId",
  strDirection = "ASC",
  intPageOffest = 0,
  intPerPage = 50,
}) => {
  try {
    // Mapping of sort keys to database column names.
    const objSortKeys = {
      intCustomerId: ` tc.pk_bint_customer_id `,
      strCustomerCode: ` tc.vchr_customer_code `,
      strCustomerName: ` tc.vchr_customer_name `,
      strEmail: ` tc.vchr_email `,
      dblOutStanding: ` tc.dbl_outstanding `,
      datCreated: ` tc.dat_created `,
    };

    // Replaceable query parts for WHERE, ORDER BY, and LIMIT clauses.
    const objReplaceKeys = {
      "{WHERE}": "",
      "{ORDER_BY}": `ORDER BY ${
        objSortKeys[strActive] || " tc.pk_bint_customer_id "
      } ${strDirection || "ASC"} `,
      "{LIMIT}": ` LIMIT ${intPerPage} OFFSET ${intPageOffest} `,
    };

    let intPos = 1; // Position counter for query parameters.
    const arrParmas: Array<string | number> = []; // Array to store query parameters.

    // Apply filters based on the provided input.
    if (strCustomerCode) {
      objReplaceKeys["{WHERE}"] += ` AND tc.vchr_customer_code = $${intPos++} `;
      arrParmas.push(strCustomerCode);
    }
    if (strCustomerName) {
      objReplaceKeys["{WHERE}"] += ` AND tc.vchr_customer_name = $${intPos++} `;
      arrParmas.push(strCustomerName);
    }
    if (strEmail) {
      objReplaceKeys["{WHERE}"] += ` AND tc.vchr_email = $${intPos++} `;
      arrParmas.push(strEmail);
    }
    if (intCustomerId) {
      objReplaceKeys[
        "{WHERE}"
      ] += ` AND tc.pk_bint_customer_id = $${intPos++} `;
      arrParmas.push(intCustomerId);
    }

    // Construct the SQL query with dynamic filters, sorting, and pagination.
    const strQuery = ` SELECT
                            COUNT(*)  OVER() AS "intTotalCount",
                            ROW_NUMBER() OVER(${objReplaceKeys["{ORDER_BY}"]}) AS "slNo",
                            tc.pk_bint_customer_id AS "intCustomerId", 
                            tc.vchr_customer_code AS "strCustomerCode",
                            tc.vchr_customer_name AS "strCustomerName",
                            tc.vchr_phone AS "strPhone",
                            tc.vchr_email AS "strEmail",
                            tc.vchr_address AS "strAddress",
                            tc.dbl_discount_percent AS "dblDiscountPercent",
                            tc.vchr_gst_no AS "strGstNo",
                            tc.vchr_gst_address AS "strGstAddress",
                            tc.dbl_outstanding AS "dblOutStanding",
                            tc.dat_created AS "datCreated",
                            tc.dat_modified AS "datModified",
                            tuc.vchr_name AS "strCreatedBy",
                            tum.vchr_name AS "strModifiedBy"
                            FROM tbl_customer tc
                            LEFT JOIN tbl_user tuc
                            ON tuc.pk_bint_user_id = tc.fk_bint_created_id 
                            AND tuc.chr_document_status = 'N'
                            LEFT JOIN tbl_user tum
                            ON tum.pk_bint_user_id = tc.fk_bint_modified_id 
                            AND tum.chr_document_status = 'N'
                            WHERE tc.chr_document_status = 'N' ${objReplaceKeys["{WHERE}"]} ${objReplaceKeys["{ORDER_BY}"]} ${objReplaceKeys["{LIMIT}"]} `;

    // Get a connection from the PostgreSQL connection pool.
    const objConnectionPool = await getPgConnection({ blnPool: true });

    // Execute the query and fetch the results.
    const { rows }: TqueryRes = await objConnectionPool.query(
      strQuery,
      arrParmas
    );
    return rows;
  } catch (err) {
    // Handle errors using the custom error handler.
    throw new ErrorHandler(err);
  }
};
