import { describe, expect, it } from "vitest";

import { CLINIC_LOCATIONS, getLocationProfile } from "./locations";

describe("CLINIC_LOCATIONS", () => {
  it("defines exactly twelve locations with unique ids", () => {
    expect(CLINIC_LOCATIONS).toHaveLength(12);
    const uniqueIds = new Set(CLINIC_LOCATIONS.map((location) => location.id));
    expect(uniqueIds.size).toBe(12);
  });

  it("uses kebab-case loc- prefixed ids", () => {
    for (const location of CLINIC_LOCATIONS) {
      expect(location.id).toMatch(/^loc-[a-z0-9-]+$/);
    }
  });

  it("gives every location a plausible staff count and IANA time zone", () => {
    for (const location of CLINIC_LOCATIONS) {
      expect(location.staffCount).toBeGreaterThanOrEqual(4);
      expect(location.staffCount).toBeLessThanOrEqual(30);
      expect(location.timeZone).toMatch(/^America\//);
    }
  });

  it("mixes Saturday-open and Saturday-closed locations", () => {
    const saturdayOpenCount = CLINIC_LOCATIONS.filter((location) => location.openSaturdays).length;
    expect(saturdayOpenCount).toBeGreaterThan(0);
    expect(saturdayOpenCount).toBeLessThan(CLINIC_LOCATIONS.length);
  });
});

describe("getLocationProfile", () => {
  it("returns identical profiles across calls for the same location", () => {
    for (const location of CLINIC_LOCATIONS) {
      expect(getLocationProfile(location)).toEqual(getLocationProfile(location));
    }
  });

  it("keeps every profile characteristic inside its documented band", () => {
    for (const location of CLINIC_LOCATIONS) {
      const profile = getLocationProfile(location);
      expect(profile.callVolumeScale).toBeGreaterThanOrEqual(0.6);
      expect(profile.callVolumeScale).toBeLessThanOrEqual(1.6);
      expect(profile.answerRatePersonality).toBeGreaterThanOrEqual(0.72);
      expect(profile.answerRatePersonality).toBeLessThanOrEqual(0.94);
      expect(profile.noShowRate).toBeGreaterThanOrEqual(0.04);
      expect(profile.noShowRate).toBeLessThanOrEqual(0.12);
      expect(profile.ratingCenter).toBeGreaterThanOrEqual(4.2);
      expect(profile.ratingCenter).toBeLessThanOrEqual(4.9);
      expect(profile.revenuePerCompletedAppointmentCents).toBeGreaterThanOrEqual(9000);
      expect(profile.revenuePerCompletedAppointmentCents).toBeLessThanOrEqual(18000);
    }
  });

  it("scales call volume with staff count so bigger offices are busier", () => {
    const sortedByStaff = [...CLINIC_LOCATIONS].sort((a, b) => a.staffCount - b.staffCount);
    const smallest = sortedByStaff[0];
    const largest = sortedByStaff[sortedByStaff.length - 1];
    if (smallest === undefined || largest === undefined) {
      throw new Error("expected locations to exist");
    }
    expect(getLocationProfile(largest).callVolumeScale).toBeGreaterThan(
      getLocationProfile(smallest).callVolumeScale,
    );
  });
});
