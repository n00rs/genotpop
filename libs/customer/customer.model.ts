import type { QueryResult } from "pg";
import type {
  TobjGetListBody,
  TobjGetListRes,
  TobjParams,
  TobjRes,
} from "../common/common.model.ts";
/**
 * Represents the body of a request to create a new customer.
 * - `strCustomerCode`: A unique code identifying the customer.
 * - `strCustomerName`: The name of the customer.
 * - `strPhone`: The phone number of the customer.
 * - `strEmail`: (Optional) The email address of the customer.
 * - `strAddress`: The physical address of the customer.
 * - `dblDiscountPercent`: The discount percentage applicable to the customer.
 * - `strGstNo`: The GST (Goods and Services Tax) number of the customer.
 * - `strGstAddress`: The GST-registered address of the customer.
 * - `dblOutStanding`: The outstanding balance for the customer.
 */
export type TobjCreateBody = {
  strCustomerCode: string;
  strCustomerName: string;
  strPhone: string;
  strEmail?: string;
  strAddress: string;
  dblDiscountPercent: number;
  strGstNo: string;
  strGstAddress: string;
  dblOutStanding: number;
};
/**
 * Represents the controller function for creating a new customer.
 *
 * @param objParams - The parameters for the request, including the body containing customer details.
 * @returns A promise that resolves to an object containing the newly created customer's ID.
 */
export type TcreateCustomerController = (
  objParams: TobjParams<TobjCreateBody>
) => Promise<TobjRes<{ intCustomerId: number }>>;
/**
 * Represents the filter criteria for querying customers.
 * - `strCustomerCode`: The unique code identifying the customer.
 * - `strCustomerName`: The name of the customer.
 * - `strEmail`: The email address of the customer.
 * - `intCustomerId`: unique ID of customer to get data of unique customer
 * - `blnBranch`: (Optional) A boolean indicating if the customer is associated with a branch.
 */
type TobjCustomerFilter = {
  intCustomerId: number;
  strCustomerCode: string;
  strCustomerName: string;
  strEmail: string;
  blnBranch?: boolean;
};
/**
 * Represents the response object for retrieving customer details.
 * Extends the `TobjCreateBody` to include additional metadata about the customer.
 * - `datCreated`: The date and time when the customer was created.
 * - `datModified`: The date and time when the customer was last modified.
 * - `strCreatedBy`: The username or identifier of the user who created the customer.
 * - `strModifiedBy`: The username or identifier of the user who last modified the customer.
 * - `intCustomerId`: unique ID of customer to get data of unique customer
 * - `slNo`: Serial Number
 */
export interface IobjGetCustomerRes extends TobjCreateBody {
  slNo: number;
  intCustomerId: number;
  datCreated: string;
  datModified: string;
  strCreatedBy: string;
  strModifiedBy: string;
}
/**
 * Represents the parameters for retrieving a list of customers.
 * - `objFilter`: An object containing filter criteria for querying customers.
 * - `intPage`: The page number for pagination.
 * - `intPageSize`: The number of records per page for pagination.
 * - `strActive`: The field by which the results should be sorted.
 * - `strDirection`: The order of sorting, either 'asc' for ascending or 'desc' for descending.
 */
type TobjGetListParams = TobjGetListBody<TobjCustomerFilter>;
/**
 * Represents the return type for retrieving a list of customers.
 * - Extends `TobjGetListRes` with a generic type `IobjGetCustomerRes` to include customer details.
 * - Contains metadata about the list, such as pagination information and the list of customers.
 */
type TobjGetListReTurn = TobjGetListRes<IobjGetCustomerRes>;

/**
 * Represents the controller function for retrieving a list of customers.
 *
 * @param objParams - The parameters for the request, including filter criteria, pagination details, and sorting options.
 * @returns A promise that resolves to an object containing metadata about the list of customers and the customer details.
 */
export type TgetCustomerController = (
  objParams: TobjParams<TobjGetListParams>
) => Promise<TobjRes<TobjGetListReTurn>>;
/**
 * Represents the query result for retrieving customer details.
 * - Combines the `IobjGetCustomerRes` interface with an additional `intTotalCount` field.
 * - Used to represent the result of a database query for customer details.
 */
export type TqueryRes = QueryResult<
  IobjGetCustomerRes & { intTotalCount: number }
>;
/**
 * Represents the function for retrieving a list of customers from the database.
 *
 * @param objParams - An object containing optional filter criteria, sorting options, and pagination details:
 * - `strCustomerCode`: (Optional) The unique code identifying the customer.
 * - `strCustomerName`: (Optional) The name of the customer.
 * - `strEmail`: (Optional) The email address of the customer.
 * - `intCustomerId`: (Optional) The unique ID of the customer.
 * - `strActive`: (Optional) The field by which the results should be sorted.
 * - `strDirection`: (Optional) The order of sorting, either 'asc' for ascending or 'desc' for descending.
 * - `intPageOffest`: (Optional) The offset for pagination, indicating the starting point of the records.
 * - `intPerPage`: (Optional) The number of records to retrieve per page.
 *
 * @returns A promise that resolves to an array of customer details, including metadata such as total count.
 */
export type TgetCustomerList = (objParams: {
  strCustomerCode?: string;
  strCustomerName?: string;
  strEmail?: string;
  intCustomerId?: number;
  strActive?: string;
  strDirection?: string;
  intPageOffest?: number;
  intPerPage?: number;
}) => Promise<TqueryRes["rows"]>;
/**
 * Represents the function for deleting a customer from the database.
 *
 * @param objParams - An object containing the unique ID of the customer to be deleted:
 * - `intCustomerId`: The unique ID of the customer to delete.
 *
 * @returns A promise that resolves to a boolean indicating whether the deletion was successful.
 */
export type TdeleteCustomer = (objParams: {
  intCustomerId: number;
}) => Promise<boolean>;
/**
 * Represents the controller function for deleting a customer.
 *
 * @param objParams - The parameters for the request, including the unique ID of the customer to delete.
 * @returns A promise that resolves to an object containing a message about the deletion status.
 */
export type TdeleteCustomerController = (
  objParams: TobjParams<{ intCustomerId: number }>
) => Promise<TobjRes<{ strMessage: string }>>;

/**
 * Represents the function for checking customer references in the database.
 *
 * @param objParams - An object containing an array of customer IDs to check for references:
 * - `arrCustomerId`: An array of customer IDs to check for references.
 *
 * @returns A promise that resolves to an array of strings representing the references found.
 */
export type TcheckCustomerReference = (objParams: {
  arrCustomerId: number[];
}) => Promise<string[]>;

/**
 * Represents the function for updating the status of customers in the database.
 *
 * @param objParams - An object containing the details for updating customer statuses:
 * - `arrCustomerId`: An array of customer IDs whose statuses need to be updated.
 * - `strStatus`: (Optional) The new status to set for the customers. Possible values are:
 *   - `"D"`: Disabled
 *   - `"M"`: Modified
 *   - `"N"`: Normal
 * - `intUserId`: The ID of the user performing the update.
 * - `timeStamp`: The timestamp of when the update is performed.
 *
 * @returns A promise that resolves to a boolean indicating whether the update was successful.
 */
export type TupdateCustomerStatus = (objParams: {
  arrCustomerId: number[];
  strStatus?: "D" | "M" | "N";
  intUserId: number;
  timeStamp: Date;
}) => Promise<boolean>;

/**
 * Represents the controller function for updating a customer's details.
 *
 * @param objParams - The parameters for the request, including the customer details to be updated.
 * @returns A promise that resolves to an object containing the updated customer's ID.
 */
export type TupdateCustomerController = (
  objParams: TobjParams<IobjGetCustomerRes>
) => Promise<TobjRes<{ intCustomerId: number }>>;

/**
 * Represents the function for updating a customer's details in the database.
 *
 * @param objParams - An object containing the details to update for a specific customer:
 * - `timeStamp`: The timestamp of when the update is performed.
 * - `intUserId`: The ID of the user performing the update.
 * - `intCustomerId`: The unique ID of the customer to update.
 * - `strPhone`: The updated phone number of the customer.
 * - `strEmail`: The updated email address of the customer.
 * - `strAddress`: The updated physical address of the customer.
 * - `dblDiscountPercent`: The updated discount percentage applicable to the customer.
 * - `strGstNo`: The updated GST (Goods and Services Tax) number of the customer.
 * - `strGstAddress`: The updated GST-registered address of the customer.
 *
 * @returns A promise that resolves to a boolean indicating whether the update was successful.
 */
export type TupdateCustomerDb = (objParams: {
  timeStamp: Date;
  intUserId: number;
  intCustomerId: number;
  strPhone: string;
  strEmail: string;
  strAddress: string;
  dblDiscountPercent: number;
  strGstNo: string;
  strGstAddress: string;
}) => Promise<boolean>;
