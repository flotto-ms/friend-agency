import { createAppSlice } from "../createAppSlice";
import api from "@/lib/api";
import { updateRate } from "@/data/rateSlice";

export type ContractHistoryItem = {
  id: string;
  userId: number;
  type: number;
  price: number;
  startedAt: string;
  endedAt?: string;
  filter?: Record<string, unknown>;
};

export interface ContractHistorySliceState {
  status: "init" | "loading" | "failed" | "loaded";
  contractId: string | null;
  contracts: ContractHistoryItem[];
}

const initialState: ContractHistorySliceState = {
  status: "init",
  contractId: null,
  contracts: [],
};

const loadContractHistory = async (id: string) => {
  const response = await api.contract.get(id);
  const userIdFromKey = Number(String(id).split("_")[0]);

  return (response.contracts ?? []).map((contract: any) => ({
    ...contract,
    id: contract.id ?? contract.key ?? id,
    userId: Number.isFinite(userIdFromKey) ? userIdFromKey : contract.userId,
  }));
};

export const contractHistorySlice = createAppSlice({
  name: "contractHistory",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(updateRate.fulfilled, (state, action) => {
      const editedRateId = action.payload.id;
      const selectedContractId = state.contractId;
      if (!selectedContractId) {
        return;
      }

      if (selectedContractId.endsWith(`_${editedRateId}`)) {
        state.status = "init";
        state.contractId = null;
        state.contracts = [];
      }
    });
  },
  reducers: (create) => ({
    loadContractHistory: create.asyncThunk(loadContractHistory, {
      pending: (state, action) => {
        state.status = "loading";
        state.contractId = action.meta.arg ?? null;
        state.contracts = [];
      },
      fulfilled: (state, action) => {
        state.status = "loaded";
        state.contractId = action.meta.arg ?? null;
        state.contracts = action.payload.sort(
          (a, b) =>
            new Date((b as any).createdAt ?? b.startedAt).getTime() -
            new Date((a as any).createdAt ?? a.startedAt).getTime(),
        );
      },
      rejected: (state) => {
        state.status = "failed";
      },
    }),
  }),
  selectors: {
    selectContractHistory: (state) => state.contracts,
    selectContractHistoryStatus: (state) => state.status,
    selectContractHistoryId: (state) => state.contractId,
  },
});

export const { loadContractHistory: loadContractHistoryAction } = contractHistorySlice.actions;
export const { selectContractHistory, selectContractHistoryStatus, selectContractHistoryId } =
  contractHistorySlice.selectors;
