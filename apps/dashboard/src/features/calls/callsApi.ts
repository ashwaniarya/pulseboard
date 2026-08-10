import type { CallRecord } from "@pulseboard/mock-api";

import { baseApi } from "../../services/api/baseApi";

export interface CallsQueryArgs {
  startDate: string;
  endDate: string;
  locationIds: string;
  statuses: string;
  search: string;
  sortBy: string;
  sortDirection: string;
}

export interface CallsPagePayload {
  data: CallRecord[];
  pagination: {
    page: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    hasNextPage: boolean;
  };
}

export const CALLS_PAGE_SIZE = 100;

function callsSearchParams(args: CallsQueryArgs, page: number): string {
  const params = new URLSearchParams({
    startDate: args.startDate,
    endDate: args.endDate,
    sortBy: args.sortBy,
    sortDirection: args.sortDirection,
    page: String(page),
    pageSize: String(CALLS_PAGE_SIZE),
  });
  if (args.locationIds !== "") {
    params.set("locationIds", args.locationIds);
  }
  if (args.statuses !== "") {
    params.set("statuses", args.statuses);
  }
  if (args.search !== "") {
    params.set("search", args.search);
  }
  return params.toString();
}

export const callsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCallsInfinite: build.infiniteQuery<CallsPagePayload, CallsQueryArgs, number>({
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
          lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
      },
      query: ({ queryArg, pageParam }) => `/calls?${callsSearchParams(queryArg, pageParam)}`,
      providesTags: ["Calls"],
    }),
  }),
});

export const { useGetCallsInfiniteInfiniteQuery } = callsApi;
