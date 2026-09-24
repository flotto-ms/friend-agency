"use client";

import { addContractAction, removeContractAction, selectActiveContractsStatus } from "@/data/activeContractsSlice";
import { type PropsWithChildren, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/data/hooks";
import { selectContractorsStatus, updateContractor } from "@/data/contractorsSlice";

const contractEventsChannel = "contracts/updates";

const getBase64URLEncoded = (authorization: any) => {
  return btoa(JSON.stringify(authorization))
    .replaceAll("+", "-") // Convert '+' to '-'
    .replaceAll("/", "_") // Convert '/' to '_'
    .replaceAll(/=+$/g, ""); // Remove padding `=`
};

export const AppSyncProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const contractStatus = useAppSelector(selectActiveContractsStatus);
  const contractorStatus = useAppSelector(selectContractorsStatus);
  const listenForChanges = contractStatus !== "init" || contractorStatus !== "init";
  const dispatch = useAppDispatch();

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

    try {
      const data = {
        host: httpDomain,
        "x-api-key": apiKey,
        "x-amz-date": new Date().toISOString().replace(/[:-]|\.\d{3}/g, ""),
      };
      const header = getBase64URLEncoded(data);
      const url = `wss://${realtimeDomain}/event/realtime`;
      const proto = [`header-${header}`, "aws-appsync-event-ws"];

      socket = new WebSocket(url, proto);
    } catch {
      return;
    }

    socket.addEventListener("open", () => {
      const apiKey = process.env.NEXT_PUBLIC_CONTRACT_EVENTS_API_KEY;
      socket?.send(
        JSON.stringify({
          type: "connection_init",
          payload: apiKey ? { Authorization: apiKey } : {},
        }),
      );
      socket?.send(
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
    });

    socket.addEventListener("message", (event) => {
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

    return () => {
      socket?.close();
    };
  }, [dispatch, listenForChanges]);

  return <>{children}</>;
};
