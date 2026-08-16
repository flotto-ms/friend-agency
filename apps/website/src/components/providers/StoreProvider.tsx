"use client";
import { setToken, signOut } from "@/data/authSlice";
import { type AppStore, makeStore } from "../../data/store";
import { setupListeners } from "@reduxjs/toolkit/query";
import { type PropsWithChildren, useEffect, useState } from "react";
import { Provider } from "react-redux";

export const StoreProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        store.dispatch(setToken(token));
      } else {
        store.dispatch(signOut());
      }
    }

    const unsubscribe = setupListeners(store.dispatch);
    return unsubscribe;
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
};
