/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as aiData from "../aiData.js";
import type * as migrations_migratePhotoSubmissions from "../migrations/migratePhotoSubmissions.js";
import type * as milestones from "../milestones.js";
import type * as payments from "../payments.js";
import type * as paystack from "../paystack.js";
import type * as projects from "../projects.js";
import type * as projectsData from "../projectsData.js";
import type * as prompts from "../prompts.js";
import type * as submissions from "../submissions.js";
import type * as users from "../users.js";
import type * as webhooks from "../webhooks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  aiData: typeof aiData;
  "migrations/migratePhotoSubmissions": typeof migrations_migratePhotoSubmissions;
  milestones: typeof milestones;
  payments: typeof payments;
  paystack: typeof paystack;
  projects: typeof projects;
  projectsData: typeof projectsData;
  prompts: typeof prompts;
  submissions: typeof submissions;
  users: typeof users;
  webhooks: typeof webhooks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
