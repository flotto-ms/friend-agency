import { ContractTableItem } from "@flotto/types";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Sha256 } from "@aws-crypto/sha256-js";

export type AppSyncContractEventType = "contract_started" | "contract_ended";

export class AppSyncUtility {
  private static readonly channel = "contracts/updates";

  static async publishContractEvent(eventType: AppSyncContractEventType, contract: ContractTableItem) {
    const apiUrl = process.env.APPSYNC_CONTRACT_EVENTS_URL;

    if (!apiUrl) {
      return;
    }

    const payload = {
      channel: this.channel,
      events: [JSON.stringify({ eventType, contract, timestamp: new Date().toISOString() })],
    };

    try {
      const url = new URL(apiUrl.replace(/\/$/, "") + "/event");

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

      const response = await fetch(url.toString(), options as any);

      if (!response.ok) {
        await response.text().then((r) => console.error(r));
        throw new Error(`AppSync Event publish failed with status ${response.status}`);
      }
    } catch (error) {
      console.warn("Failed to publish contract AppSync event", { eventType, error });
    }
  }
}
