import { DATASET_SEED_VERSION, type ClinicLocation, type LocationProfile } from "../domain";
import { createStreamRandom, randomFloatBetween, randomIntegerBetween } from "./seededRandom";

export const CLINIC_LOCATIONS: readonly ClinicLocation[] = [
  {
    id: "loc-cedar-park",
    name: "Cedar Park Dental",
    city: "Cedar Park",
    state: "TX",
    timeZone: "America/Chicago",
    staffCount: 18,
    openSaturdays: true,
  },
  {
    id: "loc-lakeview",
    name: "Lakeview Smiles",
    city: "Chicago",
    state: "IL",
    timeZone: "America/Chicago",
    staffCount: 24,
    openSaturdays: false,
  },
  {
    id: "loc-canyon-ridge",
    name: "Canyon Ridge Family Dentistry",
    city: "Lehi",
    state: "UT",
    timeZone: "America/Denver",
    staffCount: 12,
    openSaturdays: true,
  },
  {
    id: "loc-harbor-point",
    name: "Harbor Point Dental Studio",
    city: "Tacoma",
    state: "WA",
    timeZone: "America/Los_Angeles",
    staffCount: 9,
    openSaturdays: false,
  },
  {
    id: "loc-maple-grove",
    name: "Maple Grove Orthodontics",
    city: "Maple Grove",
    state: "MN",
    timeZone: "America/Chicago",
    staffCount: 15,
    openSaturdays: false,
  },
  {
    id: "loc-sunrise-mesa",
    name: "Sunrise Mesa Dental",
    city: "Mesa",
    state: "AZ",
    timeZone: "America/Phoenix",
    staffCount: 21,
    openSaturdays: true,
  },
  {
    id: "loc-willow-creek",
    name: "Willow Creek Dental Care",
    city: "Boise",
    state: "ID",
    timeZone: "America/Boise",
    staffCount: 7,
    openSaturdays: false,
  },
  {
    id: "loc-brookside",
    name: "Brookside Pediatric Dentistry",
    city: "Kansas City",
    state: "MO",
    timeZone: "America/Chicago",
    staffCount: 11,
    openSaturdays: true,
  },
  {
    id: "loc-granite-bay",
    name: "Granite Bay Dental Group",
    city: "Roseville",
    state: "CA",
    timeZone: "America/Los_Angeles",
    staffCount: 28,
    openSaturdays: true,
  },
  {
    id: "loc-foxfield",
    name: "Foxfield Family Dental",
    city: "Aurora",
    state: "CO",
    timeZone: "America/Denver",
    staffCount: 14,
    openSaturdays: false,
  },
  {
    id: "loc-river-north",
    name: "River North Dental Partners",
    city: "Nashville",
    state: "TN",
    timeZone: "America/Chicago",
    staffCount: 16,
    openSaturdays: false,
  },
  {
    id: "loc-palm-court",
    name: "Palm Court Dentistry",
    city: "Orlando",
    state: "FL",
    timeZone: "America/New_York",
    staffCount: 5,
    openSaturdays: false,
  },
];

const SMALLEST_STAFF_COUNT = Math.min(...CLINIC_LOCATIONS.map((location) => location.staffCount));
const LARGEST_STAFF_COUNT = Math.max(...CLINIC_LOCATIONS.map((location) => location.staffCount));

const profileCache = new Map<string, LocationProfile>();

export function getLocationProfile(location: ClinicLocation): LocationProfile {
  const cached = profileCache.get(location.id);
  if (cached !== undefined) {
    return cached;
  }
  const random = createStreamRandom(`${DATASET_SEED_VERSION}:${location.id}:profile`);
  const staffCountShare =
    (location.staffCount - SMALLEST_STAFF_COUNT) / (LARGEST_STAFF_COUNT - SMALLEST_STAFF_COUNT);
  const jitter = randomFloatBetween(random, -0.04, 0.04);
  const callVolumeScale = Math.min(1.6, Math.max(0.6, 0.6 + staffCountShare + jitter));
  const profile: LocationProfile = {
    callVolumeScale,
    answerRatePersonality: randomFloatBetween(random, 0.72, 0.94),
    noShowRate: randomFloatBetween(random, 0.04, 0.12),
    ratingCenter: randomFloatBetween(random, 4.2, 4.9),
    revenuePerCompletedAppointmentCents: randomIntegerBetween(random, 9000, 18000),
  };
  profileCache.set(location.id, profile);
  return profile;
}
