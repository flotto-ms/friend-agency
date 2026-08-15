import { createAppSlice } from "../createAppSlice";
import api from "@/lib/api";

export type ActiveContractItem = {
  id: string;
  userId: number;
  type: number;
  price: number;
  startedAt: string;
  endedAt?: string;
  filter?: Record<string, unknown>;
};

export interface ActiveContractsSliceState {
  status: "init" | "loading" | "failed" | "loaded";
  contracts: ActiveContractItem[];
}

const initialState: ActiveContractsSliceState = {
  status: "init",
  contracts: [],
};

const loadActiveContracts = async () => {
  const response = await api.contract.list();
  return response.contracts ?? [];
};

export const activeContractsSlice = createAppSlice({
  name: "activeContracts",
  initialState,
  reducers: (create) => ({
    loadActiveContracts: create.asyncThunk(loadActiveContracts, {
      pending: (state) => {
        state.status = "loading";
      },
      fulfilled: (state, action) => {
        state.status = "loaded";
        state.contracts = action.payload;
      },
      rejected: (state) => {
        state.status = "failed";
      },
    }),
  }),
  selectors: {
    selectActiveContracts: (state) => state.contracts,
    selectActiveContractsStatus: (state) => state.status,
  },
});

export const { loadActiveContracts: loadActiveContractsAction } = activeContractsSlice.actions;
export const { selectActiveContracts, selectActiveContractsStatus } = activeContractsSlice.selectors;
