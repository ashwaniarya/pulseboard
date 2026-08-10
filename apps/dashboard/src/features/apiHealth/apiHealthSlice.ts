import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ApiHealthState {
  status: "healthy" | "degraded";
  recentFailureTimestamps: number[];
}

const FAILURE_WINDOW_MS = 30_000;
const FAILURES_BEFORE_DEGRADED = 2;

const initialState: ApiHealthState = { status: "healthy", recentFailureTimestamps: [] };

const apiHealthSlice = createSlice({
  name: "apiHealth",
  initialState,
  reducers: {
    apiRequestFailed: (state, action: PayloadAction<{ atMs: number }>) => {
      const windowStart = action.payload.atMs - FAILURE_WINDOW_MS;
      state.recentFailureTimestamps = [
        ...state.recentFailureTimestamps.filter((timestamp) => timestamp >= windowStart),
        action.payload.atMs,
      ];
      if (state.recentFailureTimestamps.length >= FAILURES_BEFORE_DEGRADED) {
        state.status = "degraded";
      }
    },
    apiRequestSucceeded: (state) => {
      state.status = "healthy";
      state.recentFailureTimestamps = [];
    },
  },
});

export const { apiRequestFailed, apiRequestSucceeded } = apiHealthSlice.actions;
export const apiHealthReducer = apiHealthSlice.reducer;
