import { createAppSlice } from "../createAppSlice";
import api from "../../lib/api";
import { tokenDecode } from "@/lib/jwtdecode";

export interface AuthSliceState {
  status: "unauthorized" | "loading" | "authorized";
  userId: number;
  username: string;
  country: string;
  type: string;
  access?: string;
  isAdmin: boolean;
}

const initialState: AuthSliceState = {
  status: "loading",
  userId: 0,
  username: "",
  country: "",
  type: "",
  isAdmin: false,
};

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: (create) => ({
    signOut: create.reducer((state) => {
      state.status = "unauthorized";
    }),
    setToken: create.asyncThunk(
      async (token: string) => {
        localStorage.setItem("token", token);
        return api.getUser();
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "authorized";
          state.userId = action.payload.id;
          state.username = action.payload.username;
          state.country = action.payload.country;
          state.access = action.payload.access;
          state.type = getType(action.payload.access);
          state.isAdmin = tokenDecode(action.meta.arg)?.admin ?? false;
        },
      },
    ),
    becomeSupplier: create.asyncThunk(
      async () => {
        return api.user.update({ access: "supplier" });
      },
      {
        fulfilled: (state, action) => {
          state.access = action.payload.access;
          state.type = getType(action.payload.access);
        },
      },
    ),
    becomeContractor: create.asyncThunk(
      async () => {
        return api.user.update({ access: "contractor" });
      },
      {
        fulfilled: (state, action) => {
          state.access = action.payload.access;
          state.type = getType(action.payload.access);
        },
      },
    ),
  }),
  selectors: {
    selectAuth: (state) => state,
  },
});

export const getType = (access?: string) => {
  if (access === "contractor") {
    return "Contractor";
  }
  if (access === "supplier") {
    return "Supplier";
  }
  return "Member";
};

export const { becomeContractor, becomeSupplier, setToken, signOut } = authSlice.actions;
export const { selectAuth } = authSlice.selectors;
