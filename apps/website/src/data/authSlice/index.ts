import { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../createAppSlice";
import api from "./api";

export interface AuthSliceState {
  status: "unauthorized" | "loading" | "authorized";
  userId: number;
  username: string;
  country: string;
  type: string;
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
          state.type = action.payload.contractor ? "Contractor" : "Member";
        },
      },
    ),
  }),
  selectors: {
    selectAuth: (state) => state,
  },
});
export const { setToken, signOut } = authSlice.actions;
export const { selectAuth } = authSlice.selectors;
