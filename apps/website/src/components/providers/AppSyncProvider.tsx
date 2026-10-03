"use client";

import {
  addContractAction,
  loadActiveContractsAction,
  removeContractAction,
  selectActiveContractsStatus,
} from "@/data/activeContractsSlice";
import { type PropsWithChildren, useEffect } from "react";
import { useAppSelector, useAppStore } from "@/data/hooks";
import { loadContractorsAction, selectContractorsStatus, updateContractor } from "@/data/contractorsSlice";
import { AppStore } from "@/data/store";

const realtimeDomain = process.env.NEXT_PUBLIC_CONTRACT_EVENTS_REALTIME_DOMAIN;
const httpDomain = process.env.NEXT_PUBLIC_CONTRACT_EVENTS_HTTP_DOMAIN;
const apiKey = process.env.NEXT_PUBLIC_CONTRACT_EVENTS_API_KEY;

const contractEventsChannel = "contracts/updates";
const initialRetryDelay = 1_000;
const maxRetryDelay = 30_000;
const keepAliveDuration = 62_500;

const getBase64URLEncoded = (authorization: any) => {
  return btoa(JSON.stringify(authorization)).replaceAll("+", "-").replaceAll("/", "_").replaceAll(/=+$/g, "");
};

export const AppSyncProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const contractStatus = useAppSelector(selectActiveContractsStatus);
  const contractorStatus = useAppSelector(selectContractorsStatus);
  const listenForChanges = contractStatus !== "init" || contractorStatus !== "init";
  const store = useAppStore();

  useEffect(() => {
    if (typeof window === "undefined" || !listenForChanges) {
      return;
    }

    if (!realtimeDomain || !httpDomain || !apiKey) {
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    let kaTimeout: ReturnType<typeof setTimeout> | null = null;
    let lastKa: number = 0;
    let retryAttempt = 0;
    let disposed = false;

    const scheduleReconnect = () => {
      if (disposed || reconnectTimeout !== null) {
        return;
      }

      const delay = Math.min(initialRetryDelay * 2 ** retryAttempt, maxRetryDelay);
      retryAttempt += 1;
      reconnectTimeout = setTimeout(() => {
        reconnectTimeout = null;
        connect();
      }, delay);
    };

    const connect = () => {
      if (disposed) {
        return;
      }

      let currentSocket: WebSocket;
      const parms = createConnectionParams();
      try {
        currentSocket = new WebSocket(parms.url, parms.proto);
        socket = currentSocket;
      } catch {
        scheduleReconnect();
        return;
      }

      currentSocket.addEventListener("open", () => {
        sendHandshake(currentSocket);
        const downtime = Date.now() - lastKa;
        if (lastKa && downtime > 10_000) {
          resyncData(store);
        }
        lastKa = 0;
        retryAttempt = 0;
      });

      currentSocket.addEventListener("message", (event) => {
        try {
          const message = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (message.type === "ka") {
            if (kaTimeout) {
              clearTimeout(kaTimeout);
            }

            if (lastKa > 0 && Date.now() - lastKa > keepAliveDuration) {
              currentSocket.close();
              return;
            }

            lastKa = Date.now();
            kaTimeout = setTimeout(() => {
              currentSocket.close();
            }, keepAliveDuration);
            return;
          }
          const contractEvent = JSON.parse(message.event);
          const channel = (message as Record<string, unknown>)?.channel as string | undefined;
          if (!contractEvent || (channel && channel !== contractEventsChannel)) {
            return;
          }

          switch (contractEvent.eventType) {
            case "contract_started":
              store.dispatch(addContractAction(contractEvent.contract));
              break;
            case "contract_ended":
              store.dispatch(removeContractAction(contractEvent.contract));
              break;
            case "contractor_updated":
            case "contractor_created":
              store.dispatch(updateContractor(contractEvent.contractor));
              break;
          }
        } catch {
          // Ignore non-JSON or malformed payloads.
        }
      });

      currentSocket.addEventListener("error", (e) => {
        console.log("socket error", e);
        currentSocket.close();
      });

      currentSocket.addEventListener("close", () => {
        if (kaTimeout) {
          clearTimeout(kaTimeout);
        }
        if (socket === currentSocket) {
          socket = null;
        }
        scheduleReconnect();
      });
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (kaTimeout) {
        clearTimeout(kaTimeout);
      }
      socket?.close();
    };
  }, [store, listenForChanges]);

  return <>{children}</>;
};

const resyncData = (store: AppStore) => {
  console.log("resync data");
  if (selectActiveContractsStatus(store.getState()) === "loaded") {
    store.dispatch(loadActiveContractsAction());
  }
  if (selectContractorsStatus(store.getState()) === "loaded") {
    store.dispatch(loadContractorsAction());
  }
};

const createConnectionParams = () => {
  const data = {
    host: httpDomain,
    "x-api-key": apiKey,
    "x-amz-date": new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""),
  };
  const header = getBase64URLEncoded(data);
  const url = `wss://${realtimeDomain}/event/realtime`;
  const proto = [`header-${header}`, "aws-appsync-event-ws"];

  return {
    url,
    proto,
  };
};

const sendHandshake = (socket: WebSocket) => {
  socket.send(
    JSON.stringify({
      type: "connection_init",
      payload: { Authorization: apiKey },
    }),
  );
  socket.send(
    JSON.stringify({
      type: "subscribe",
      channel: contractEventsChannel,
      id: "contract_updates",
      authorization: {
        "x-api-key": apiKey,
        host: httpDomain,
      },
    }),
  );
};
