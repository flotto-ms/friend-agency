import AWS = require("aws-sdk");
import { ContractTableItem } from "@flotto/types";

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
      const endpoint = new AWS.Endpoint(apiUrl.replace(/\/$/, ""));
      const request = new AWS.HttpRequest(endpoint, AWS.config.region || process.env.AWS_REGION || "us-east-1");
      request.method = "POST";
      request.path = "/event";
      request.headers["Content-Type"] = "application/json";
      request.headers["Host"] = endpoint.host;
      request.body = JSON.stringify(payload);

      const credentials = await new Promise<AWS.Credentials>((resolve, reject) => {
        AWS.config.getCredentials((error, creds) => {
          if (error) {
            reject(error);
            return;
          }

          if (!creds || !("accessKeyId" in creds)) {
            reject(new Error("Missing AWS credentials for AppSync Event publish."));
            return;
          }

          resolve(creds as AWS.Credentials);
        });
      });

      const signer = new (AWS as any).Signers.V4(request, "appsync");
      signer.addAuthorization(credentials, new Date());

      const options = {
        method: request.method,
        headers: request.headers,
        body: request.body,
      };
      console.debug(options);

      const response = await fetch(`${endpoint.href.replace(/\/$/, "")}${request.path}`, options);

      if (!response.ok) {
        await response.text().then((r) => console.error(r));
        throw new Error(`AppSync Event publish failed with status ${response.status}`);
      }
    } catch (error) {
      console.warn("Failed to publish contract AppSync event", { eventType, error });
    }
  }
}
