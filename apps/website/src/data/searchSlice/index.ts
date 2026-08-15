import { RateFilter } from "@/lib/FilterDesc";
import { createAppSlice } from "../createAppSlice";
import api from "../authSlice/api";
import { QuestSearchItem } from "@/components/tables/QuestSearchTable/types";

type Contractor = {
  id: number;
  country: string;
  username: string;
  slots: number;
  full: boolean;
  accepting: boolean;
  available: boolean;
};

type Contract = {
  id: string;
  type: number;
  userId: number;
  price: number;
  totalSales: number;
  queueLength: number;
  filter?: RateFilter;
  lastSale?: string;
};

export interface SearchSliceState {
  status: "init" | "loading" | "failed" | "loaded";
  quests: QuestSearchItem[];
  contractors: Contractor[];
  contracts: Contract[];
}

const initialState: SearchSliceState = {
  status: "init",
  quests: [],
  contractors: [],
  contracts: [],
};

const initState = async () => {
  return Promise.all([api.contract.list(), api.user.list({ type: "contractor" }), api.user.getUnsentQuests()]);
};

export const searchSlice = createAppSlice({
  name: "search",
  initialState,
  reducers: (create) => ({
    initSearch: create.asyncThunk(initState, {
      pending: (state) => {
        state.status = "loading";
      },
      fulfilled: (state, action) => {
        state.contracts = action.payload[0].contracts;
        state.contractors = action.payload[1].users;
        state.quests = (action.payload[2] as QuestSearchItem[])
          .sort((a: any, b: any) => a.type - b.type)
          .map((q: any) => ({ ...q, rate: q.flotto.price / (q.level * (q.isElite ? 3 : 1)) }));
        state.status = "loaded";
      },
      rejected: (state) => {
        state.status = "failed";
      },
    }),
  }),
  selectors: {
    selectSearchStatus: (state) => state.status,
    selectSearchQuests: (state) => state.quests,
    selectSearchContractors: (state) => state.contractors,
    selectSearchContracts: (state) => state.contracts,
  },
});

export const { initSearch } = searchSlice.actions;
export const { selectSearchStatus, selectSearchQuests, selectSearchContractors, selectSearchContracts } =
  searchSlice.selectors;
