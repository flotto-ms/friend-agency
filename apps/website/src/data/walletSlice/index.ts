import { createAppSlice } from "../createAppSlice";
import api from "@/lib/api";

export type WalletTransaction = {
  id: number;
  sent: boolean;
  type: number;
  isElite: boolean;
  level: number;
  description: string;
  price: number;
  status: string;
  date: string;
  username: string;
  country: string;
};

export interface WalletSliceState {
  status: "init" | "loading" | "failed" | "loaded";
  transactions: WalletTransaction[];
}

const initialState: WalletSliceState = {
  status: "init",
  transactions: [],
};

const loadTransactions = async () => {
  const response = await api.user.transactions.list();
  const items: WalletTransaction[] = response.items ?? [];
  return items.filter((tx) => tx.status !== "Inactive");
};

export const walletSlice = createAppSlice({
  name: "wallet",
  initialState,
  reducers: (create) => ({
    loadWalletTransactions: create.asyncThunk(loadTransactions, {
      pending: (state) => {
        state.status = "loading";
      },
      fulfilled: (state, action) => {
        state.status = "loaded";
        state.transactions = action.payload;
      },
      rejected: (state) => {
        state.status = "failed";
      },
    }),
  }),
  selectors: {
    selectWalletTransactions: (state) => state.transactions,
    selectWalletStatus: (state) => state.status,
    selectWalletSummary: (state) => {
      const received = state.transactions
        .filter((transaction) => !transaction.sent)
        .reduce((total, transaction) => {
          return total + transaction.price;
        }, 0);
      const sent = state.transactions
        .filter((transaction) => transaction.sent)
        .reduce((total, transaction) => {
          return total + transaction.price;
        }, 0);
      const agencyFees = received * 0.05;
      const balance = sent - received - agencyFees;

      return {
        received,
        sent,
        agencyFees,
        balance,
      };
    },
    selectWalletBalance: (state) => {
      const received = state.transactions
        .filter((transaction) => !transaction.sent)
        .reduce((total, transaction) => {
          return total + transaction.price;
        }, 0);
      const sent = state.transactions
        .filter((transaction) => transaction.sent)
        .reduce((total, transaction) => {
          return total + transaction.price;
        }, 0);
      const agencyFees = received * 0.05;
      return sent - received - agencyFees;
    },
  },
});

export const { loadWalletTransactions } = walletSlice.actions;
export const { selectWalletTransactions, selectWalletStatus, selectWalletSummary, selectWalletBalance } =
  walletSlice.selectors;
