import type { ClinicLocation } from "@pulseboard/mock-api";

import { baseApi } from "../../services/api/baseApi";

interface LocationsResponse {
  data: ClinicLocation[];
}

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLocations: build.query<ClinicLocation[], void>({
      query: () => "/locations",
      transformResponse: (response: LocationsResponse) => response.data,
      providesTags: ["Locations"],
      keepUnusedDataFor: 3600,
    }),
  }),
});

export const { useGetLocationsQuery } = locationsApi;
