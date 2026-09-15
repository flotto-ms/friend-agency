import { createAppSlice } from "../createAppSlice";
import api from "@/lib/api";

export type SupplierUser = {
  id: number;
  username: string;
  country: string;
  supplier: boolean;
  slots?: number;
  available?: boolean;
};

export interface SuppliersSliceState {
  status: "init" | "loading" | "failed" | "loaded";
  suppliers: SupplierUser[];
}

const initialState: SuppliersSliceState = {
  status: "init",
  suppliers: [],
};

const loadSuppliers = async () => {
  const response = await api.user.list({ type: "supplier" });
  return response.users ?? [];
};

export const suppliersSlice = createAppSlice({
  name: "suppliers",
  initialState,
  reducers: (create) => ({
    loadSuppliers: create.asyncThunk(loadSuppliers, {
      pending: (state) => {
        state.status = "loading";
      },
      fulfilled: (state, action) => {
        state.status = "loaded";
        state.suppliers = action.payload;
      },
      rejected: (state) => {
        state.status = "failed";
      },
    }),
  }),
  selectors: {
    selectSuppliers: (state) => state.suppliers,
    selectSuppliersStatus: (state) => state.status,
  },
});

export const { loadSuppliers: loadSuppliersAction } = suppliersSlice.actions;
export const { selectSuppliers, selectSuppliersStatus } = suppliersSlice.selectors;
