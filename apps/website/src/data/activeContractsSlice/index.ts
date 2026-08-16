import { createAppSlice } from "../createAppSlice";
import api from "@/lib/api";
import type { PayloadAction } from "@reduxjs/toolkit";

export type ActiveContractItem = {
  id: string;
  userId: number;
  type: number;
  price: number;
  startedAt: string;
  endedAt?: string;
  filter?: Record<string, unknown>;
};

export type ContractTableItem = {
  key: string;
  userId: number;
  rateId: string;
  type: number;
  price: number;
  startedAt: string;
  endedAt: string;
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
    addContract: create.reducer((state, action: PayloadAction<ContractTableItem>) => {
      const contract = action.payload;
      const existingIndex = state.contracts.findIndex((item) => item.id === contract.key);

      if (existingIndex >= 0) {
        return;
      }

      state.contracts = [
        {
          id: contract.key,
          userId: contract.userId,
          startedAt: contract.startedAt,
          type: contract.type,
          endedAt: contract.endedAt,
          filter: contract.filter,
          price: contract.price,
        },
        ...state.contracts,
      ];
    }),
    removeContract: create.reducer((state, action: PayloadAction<ContractTableItem>) => {
      state.contracts = state.contracts.filter(
        (contract) => contract.id !== action.payload.key && contract.startedAt !== action.payload.startedAt,
      );
    }),
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

export const {
  addContract: addContractAction,
  removeContract: removeContractAction,
  loadActiveContracts: loadActiveContractsAction,
} = activeContractsSlice.actions;
export const { selectActiveContracts, selectActiveContractsStatus } = activeContractsSlice.selectors;
