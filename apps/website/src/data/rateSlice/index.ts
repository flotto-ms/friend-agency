import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../createAppSlice";
import {
  postAddGroup,
  postDeleteGroup,
  fetchRates,
  type GetRateResponse,
  postSaveRate,
} from "./api";

export interface RateSliceState {
  status: "init" | "loading" | "failed" | "loaded";
  rates: GetRateResponse["rates"];
  groups: GetRateResponse["groups"];
}

const initialState: RateSliceState = {
  status: "init",
  rates: {},
  groups: {},
};

export const rateSlice = createAppSlice({
  name: "rate",
  initialState,
  reducers: (create) => ({
    setRateEnabled: create.reducer(
      (state, action: PayloadAction<{ id: string; enabled: boolean }>) => {
        const rate = state.rates[action.payload.id];
        if (rate.enabled === action.payload.enabled) {
          return;
        }
        rate.enabled = action.payload.enabled;
        if (!rate.enabled) {
          rate.stopping = true;
        }
      },
    ),
    resetStopped: create.asyncThunk(
      async (id: string) =>
        new Promise<string>((resolve) => setTimeout(() => resolve(id), 30_000)),
      {
        fulfilled: (state, action) => {
          state.rates[action.payload].stopping = false;
        },
      },
    ),
    updateRate: create.asyncThunk(postSaveRate, {
      fulfilled: (state, action) => {
        const {
          payload: { id, ...item },
        } = action;
        state.rates[id] = item;
      },
    }),
    createGroup: create.asyncThunk(postAddGroup, {
      fulfilled: (state, action) => {
        state.groups[action.payload.id] = { label: action.payload.label };
        action.payload.rates?.forEach((id) => {
          const rate = state.rates[id];
          if (!rate) {
            return;
          }
          if (!rate.groups) {
            rate.groups = [];
          }
          rate.groups.push(action.payload.id);
        });
      },
    }),
    deleteGroup: create.asyncThunk(postDeleteGroup, {
      fulfilled: (state, action) => {
        Object.values(state.rates).forEach((r) => {
          if (r.groups) {
            r.groups = r.groups.filter((g) => g !== action.payload);
          }
        });
        delete state.groups[action.payload];
      },
    }),
    loadInitialRates: create.asyncThunk(fetchRates, {
      pending: (state) => {
        if (state.status === "init") {
          state.status = "loading";
        }
      },
      fulfilled: (state, action) => {
        state.status = "loaded";
        state.rates = action.payload.rates;
        state.groups = action.payload.groups;
      },
      rejected: (state) => {
        state.status = "failed";
      },
    }),
  }),
  selectors: {
    selectRates: (state) => state,
  },
});

export const {
  loadInitialRates,
  setRateEnabled,
  resetStopped,
  updateRate,
  createGroup,
  deleteGroup,
} = rateSlice.actions;
export const { selectRates } = rateSlice.selectors;
