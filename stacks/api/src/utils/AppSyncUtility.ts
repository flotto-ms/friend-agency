import { ContractTableItem, UserTableItem } from "@flotto/types";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";

export type AppSyncContractEventType = "contract_started" | "contract_ended";
export type AppSyncUserEventType = "contractor_created" | "contractor_updated";

const apiUrl = process.env.APPSYNC_CONTRACT_EVENTS_URL!;

const publishEvent = async (payload: object) => {
  const url = new URL(`${apiUrl.replace(/\/$/, "")}/event`);

  const request = new HttpRequest({
    method: "POST",
    hostname: url.hostname,
    path: url.pathname,
    headers: {
      "Content-Type": "application/json",
      host: url.hostname,
    },
    body: JSON.stringify(payload),
  });

  const signer = new SignatureV4({
    credentials: fromNodeProviderChain(),
    region: process.env.AWS_REGION || "us-east-1",
    service: "appsync",
    sha256: Sha256,
  });

  const signedRequest = await signer.sign(request);

  const options = {
    method: signedRequest.method,
    headers: signedRequest.headers,
    body: signedRequest.body as any,
  };
  console.debug(options);

  return fetch(url.toString(), options as any);
};

export class AppSyncUtility {
  private static readonly channel = "contracts/updates";

  static async publishContractEvent(eventType: AppSyncContractEventType, contract: ContractTableItem) {
    if (!apiUrl) {
      return;
    }

    const payload = {
      channel: this.channel,
      events: [JSON.stringify({ eventType, contract, timestamp: new Date().toISOString() })],
    };

    try {
      const response = await publishEvent(payload);

      if (!response.ok) {
        await response.text().then((r) => console.error(r));
        throw new Error(`AppSync Event publish failed with status ${response.status}`);
      }
    } catch (error) {
      console.warn("Failed to publish contract AppSync event", { eventType, error });
    }
  }

  static async publishContractorEvent(eventType: AppSyncUserEventType, user: UserTableItem) {
    if (!apiUrl) {
      return;
    }

    const contractor = {
      id: user.id,
      country: user.country,
      username: user.username,
      available: user.available ?? false,
      slots: user.slots ?? 0,
    };

    const payload = {
      channel: this.channel,
      events: [JSON.stringify({ eventType, contractor, timestamp: new Date().toISOString() })],
    };

    try {
      const response = await publishEvent(payload);

      if (!response.ok) {
        await response.text().then((r) => console.error(r));
        throw new Error(`AppSync Event publish failed with status ${response.status}`);
      }
    } catch (error) {
      console.warn("Failed to publish contract AppSync event", { eventType, error });
    }
  }
}
