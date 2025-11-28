/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as churnPrediction from "../churnPrediction.js";
import type * as csvUpload from "../csvUpload.js";
import type * as customers from "../customers.js";
import type * as http from "../http.js";
import type * as retentionCampaigns from "../retentionCampaigns.js";
import type * as router from "../router.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  churnPrediction: typeof churnPrediction;
  csvUpload: typeof csvUpload;
  customers: typeof customers;
  http: typeof http;
  retentionCampaigns: typeof retentionCampaigns;
  router: typeof router;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
