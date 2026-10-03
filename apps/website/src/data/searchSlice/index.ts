import { createAppSlice } from "../createAppSlice";
import api from "../../lib/api";
import { QuestSearchItem } from "@/components/tables/QuestSearchTable/types";
import { PayloadAction } from "@reduxjs/toolkit";

export interface SearchSliceState {
  status: "init" | "loading" | "failed" | "loaded";
  quests: QuestSearchItem[];
}

const initialState: SearchSliceState = {
  status: "init",
  quests: [],
};

const initState = async () => {
  return api.user.getUnsentQuests();
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
        state.quests = (action.payload as QuestSearchItem[])
          .sort((a: any, b: any) => a.type - b.type)
          .map((q: any) => ({ ...q, elite: q.isElite, rate: q.flotto.price / (q.level * (q.isElite ? 3 : 1)) }));
        state.status = "loaded";
      },
      rejected: (state) => {
        state.status = "failed";
      },
    }),
    deleteQuests: create.reducer((state, action: PayloadAction<number[]>) => {
      state.quests = state.quests.filter((q) => !action.payload.some((id) => q.id === id));
    }),
  }),
  selectors: {
    selectSearchStatus: (state) => state.status,
    selectSearchQuests: (state) => state.quests,
  },
});

export const { initSearch, deleteQuests } = searchSlice.actions;
export const { selectSearchStatus, selectSearchQuests } = searchSlice.selectors;
