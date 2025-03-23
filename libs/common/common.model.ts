import type { Request } from "express";

/**
 * This file contains common TypeScript types and interfaces
 * used across the inventory management system.
 */

/**
 * Represents a user object retrieved by email.
 * This type is used to define the structure of user data
 * when fetched using an email address.
 */
export type TobjUserByEmail = {
  intUserId: number;
  strEmail: string;
  strPassword: string;
  strRole: string;
  strAccPrivateKey: string;
  strRefrPrivateKey: string;
};

//
/**
 * Represents the parameters for a request.
 * This type is used to define the structure of the request parameters,
 * including the body, query, cookies, user ID, method, headers, and other metadata.
 *
 * @template Body - The type of the request body.
 */
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
/**
 * Represents a standardized response object.
 * This type is commonly used to define the structure of API responses,
 * including an optional status code, message, and additional response data.
 *
 * @template Res - The type of the additional response data.
 */
export type TobjRes<Res> = {
  intStatusCode?: number;
  strMessage?: string;
} & Res;
/**
 * Represents pagination details for GET APIs.
 * This type is used to standardize the structure of pagination data
 * in API responses, providing information about the current page,
 * items per page, and the total count of items.
 */
export type TobjPagination = {
  intPageOffset: number; // The current page offset (starting from 0).
  intPerPage: number; // The number of items per page.
  intTotalCount: number; // The total number of items available.
};
/**
 * Represents sorting details for GET APIs.
 * This type is used to define the structure of sorting parameters,
 * including the active field to sort by and the direction of sorting.
 *
 * - `strActive`: The field name to sort by (e.g., "name", "date").
 * - `strDirection`: The direction of sorting, either "ASC" for ascending or "DESC" for descending.
 */
export type TobjSort = {
  strActive: string;
  strDirection: "ASC" | "DESC" | "asc" | "desc";
};
/**
 * Represents the structure of the request body for a common GET list API.
 * This type is used to standardize the payload for retrieving a list of items,
 * including pagination, sorting, and filtering details.
 *
 * @template TobjFilter - The type of the filter object used to filter the list.
 *
 * - `objPagination`: Contains details about the current page, items per page, and total count.
 * - `objSort`: Specifies the sorting field and direction (ascending or descending).
 * - `objFilter`: Defines the filtering criteria for the list.
 */
export type TobjGetListBody<TobjFilter> = {
  objPagination: TobjPagination;
  objSort: TobjSort;
  objFilter: TobjFilter;
};
/**
 * Represents the structure of the response body for a common GET list API.
 * This type is used to standardize the payload for retrieving a list of items,
 * including pagination, sorting, and the list of items.
 *
 * @template TobjRes - The type of the individual items in the list.
 *
 * - `objPagination`: Contains details about the current page, items per page, and total count.
 * - `objSort`: Specifies the sorting field and direction (ascending or descending).
 * - `arrList`: An array of items of type `TobjRes` representing the retrieved list.
 */
export type TobjGetListRes<TobjRes> = {
  objPagination: TobjPagination;
  objSort: TobjSort;
  arrList: TobjRes[];
};
