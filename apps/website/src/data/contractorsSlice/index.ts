import { createAppSlice } from "../createAppSlice";
import api from "@/lib/api";

export type ContractorUser = {
  id: number;
  username: string;
  country: string;
  contractor: boolean;
  slots?: number;
  available?: boolean;
};

export interface ContractorsSliceState {
  status: "init" | "loading" | "failed" | "loaded";
  contractors: ContractorUser[];
}

const initialState: ContractorsSliceState = {
  status: "init",
  contractors: [],
};

const loadContractors = async () => {
  const response = await api.user.list({ type: "contractor" });
  return response.users ?? [];
};

export const contractorsSlice = createAppSlice({
  name: "contractors",
  initialState,
  reducers: (create) => ({
    loadContractors: create.asyncThunk(loadContractors, {
      pending: (state) => {
        state.status = "loading";
      },
      fulfilled: (state, action) => {
        state.status = "loaded";
        state.contractors = action.payload;
      },
      rejected: (state) => {
        state.status = "failed";
      },
    }),
  }),
  selectors: {
    selectContractors: (state) => state.contractors,
    selectContractorsStatus: (state) => state.status,
  },
});

export const { loadContractors: loadContractorsAction } = contractorsSlice.actions;
export const { selectContractors, selectContractorsStatus } = contractorsSlice.selectors;
