import { MultiSelect } from "@pulseboard/ui";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useGetLocationsQuery } from "../locations/locationsApi";
import { locationSelectionChanged } from "./filtersSlice";

export function LocationFilterControl() {
  const dispatch = useAppDispatch();
  const selectedLocationIds = useAppSelector((state) => state.filters.selectedLocationIds);
  const { data: locations } = useGetLocationsQuery();
  return (
    <MultiSelect
      label="Locations"
      options={(locations ?? []).map((location) => ({
        value: location.id,
        label: location.name,
      }))}
      selectedValues={selectedLocationIds}
      onSelectionChange={(nextSelection) => {
        dispatch(locationSelectionChanged(nextSelection));
      }}
      emptySelectionSummary="All locations"
    />
  );
}
