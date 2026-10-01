"use client";

import {
  addContractAction,
  loadActiveContractsAction,
  removeContractAction,
  selectActiveContractsStatus,
} from "@/data/activeContractsSlice";
import { type PropsWithChildren, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import { loadContractorsAction, selectContractorsStatus, updateContractor } from "@/data/contractorsSlice";
import { useStore } from "react-redux";

const contractEventsChannel = "contracts/updates";
const initialRetryDelay = 1_000;
const maxRetryDelay = 30_000;

const getBase64URLEncoded = (authorization: any) => {
  return btoa(JSON.stringify(authorization)).replaceAll("+", "-").replaceAll("/", "_").replaceAll(/=+$/g, "");
};

export const AppSyncProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const contractStatus = useAppSelector(selectActiveContractsStatus);
  const contractorStatus = useAppSelector(selectContractorsStatus);
  const listenForChanges = contractStatus !== "init" || contractorStatus !== "init";
  const dispatch = useAppDispatch();
  const store = useStore<any>();

  useEffect(() => {
    if (typeof window === "undefined" || !listenForChanges) {
      return;
    }

    const realtimeDomain = process.env.NEXT_PUBLIC_CONTRACT_EVENTS_REALTIME_DOMAIN;
    const httpDomain = process.env.NEXT_PUBLIC_CONTRACT_EVENTS_HTTP_DOMAIN;
    const apiKey = process.env.NEXT_PUBLIC_CONTRACT_EVENTS_API_KEY;
    if (!realtimeDomain || !httpDomain || !apiKey) {
      return;
    }

    let socket: WebSocket | null = null;
    let lastDisconnect: number | undefined = Date.now();
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
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

      const data = {
        host: httpDomain,
        "x-api-key": apiKey,
        "x-amz-date": new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""),
      };
      const header = getBase64URLEncoded(data);
      const url = `wss://${realtimeDomain}/event/realtime`;
      const proto = [`header-${header}`, "aws-appsync-event-ws"];

      let currentSocket: WebSocket;
      try {
        currentSocket = new WebSocket(url, proto);
        socket = currentSocket;
        (window as any).appSyncSocket = currentSocket;
      } catch {
        scheduleReconnect();
        return;
      }

      currentSocket.addEventListener("open", () => {
        currentSocket.send(
          JSON.stringify({
            type: "connection_init",
            payload: { Authorization: apiKey },
          }),
        );
        currentSocket.send(
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

        if (lastDisconnect) {
          const downtime = Date.now() - lastDisconnect;
          if (downtime > 10_000) {
            if (selectActiveContractsStatus(store.getState()) === "loaded") {
              dispatch(loadActiveContractsAction());
            }
            if (selectContractorsStatus(store.getState()) === "loaded") {
              dispatch(loadContractorsAction());
            }
          }
        }

        retryAttempt = 0;
        lastDisconnect = undefined;
      });

      currentSocket.addEventListener("message", (event) => {
        try {
          const message = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          const contractEvent = JSON.parse(message.event);
          const channel = (message as Record<string, unknown>)?.channel as string | undefined;
          if (!contractEvent || (channel && channel !== contractEventsChannel)) {
            return;
          }

          switch (contractEvent.eventType) {
            case "contract_started":
              dispatch(addContractAction(contractEvent.contract));
              break;
            case "contract_ended":
              dispatch(removeContractAction(contractEvent.contract));
              break;
            case "contractor_updated":
            case "contractor_created":
              dispatch(updateContractor(contractEvent.contractor));
              break;
          }
        } catch {
          // Ignore non-JSON or malformed payloads.
        }
      });

      currentSocket.addEventListener("error", () => {
        currentSocket.close();
      });

      currentSocket.addEventListener("close", () => {
        lastDisconnect = Date.now();
        if (socket === currentSocket) {
          socket = null;
        }
        scheduleReconnect();
      });
    };

    connect();

    return () => {
      disposed = true;
      if (reconnectTimeout !== null) {
        clearTimeout(reconnectTimeout);
      }
      socket?.close();
    };
  }, [dispatch, listenForChanges]);

  return <>{children}</>;
};
