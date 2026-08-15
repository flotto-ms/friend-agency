import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type TokenType = "bot" | "qqs" | "notices";
export type TokenResponse = {
  authKey: string;
  session: string;
  userId: number;
  build: number;
};

let secret: string | undefined = undefined;
const tokens: Record<string, TokenResponse> = {};

const getToken = async (name: TokenType) => {
  if (tokens[name]) {
    return tokens[name];
  }

  return new S3Client()
    .send(
      new GetObjectCommand({
        Bucket: process.env.CONFIG_BUCKET,
        Key: `tokens/${name}.json`,
      }),
    )
    .then((r) => r.Body!.transformToString())
    .then((data) => JSON.parse(data) as TokenResponse)
    .then((token) => {
      tokens[name] = token;
      return token;
    });
};

const getSecret = async () => {
  if (secret) {
    return secret;
  }

  return new S3Client()
    .send(
      new GetObjectCommand({
        Bucket: process.env.CONFIG_BUCKET,
        Key: `tokens/secret.txt`,
      }),
    )
    .then((r) => r.Body!.transformToString())
    .then((data) => {
      secret = data;
      return data;
    });
};

export default {
  getSecret,
  getToken,
};
