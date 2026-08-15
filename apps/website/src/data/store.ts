import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./authSlice";
import { rateSlice } from "./rateSlice";
import { searchSlice } from "./searchSlice";
import { activeContractsSlice } from "./activeContractsSlice";
import { contractorsSlice } from "./contractorsSlice";
import { contractHistorySlice } from "./contractHistorySlice";

const rootReducer = combineSlices(
  authSlice,
  rateSlice,
  searchSlice,
  activeContractsSlice,
  contractorsSlice,
  contractHistorySlice,
);
export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    devTools: true,
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<ThunkReturnType, RootState, unknown, Action>;
