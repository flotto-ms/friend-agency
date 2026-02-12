import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchGetCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
  QueryCommand,
  type QueryCommandInput,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

let client: DynamoDBClient | undefined = undefined;
let doc: DynamoDBDocumentClient | undefined = undefined;

type PutItem<T> = {
  TableName: string;
  Item: T;
};

export const putItem = async <T extends object>({ Item, TableName }: PutItem<T>) => {
  const command = new PutCommand({
    TableName,
    Item: Item,
  });
  console.debug(JSON.stringify(command.input, null, 2));
  return createClient()
    .send(command)
    .then(() => Item);
};

type GetItem = {
  Key: Record<string, any>;
  TableName: string;
};

export const getItem = async <T>({ Key, TableName }: GetItem) => {
  const command = new GetCommand({ TableName, Key });
  console.debug(JSON.stringify(command.input, null, 2));
  return createClient()
    .send(command)
    .then((response) => response.Item as T | undefined);
};

export const getItems = async <T>({ TableName }: { TableName: string }) => {
  const command = new ScanCommand({ TableName });
  return createClient()
    .send(command)
    .then((response) => response.Items as T[]);
};

type UpdateItem = {
  Key: Record<string, any>;
  TableName: string;
  Attrs: object;
  Upsert?: boolean;
};

export const updateItem = async <T>({ Key, TableName, Attrs, Upsert = false }: UpdateItem) => {
  const command = createUpdateCommand(Key, TableName, Attrs, Upsert);
  console.debug(JSON.stringify(command.input, null, 2));
  return createClient()
    .send(command)
    .then((response) => ({ ...response.Attributes }) as T);
};

/**
 * Builds an update command for replacing or deleting top level attributes on an object.
 * Updating nested attributes without affecting siblings will require a custom command.
 */
export const createUpdateCommand = (Key: Record<string, any>, TableName: string, attrs: object, upsert: boolean) => {
  const toDelete = Object.entries(attrs)
    .filter(([_, val]) => val === null)
    .map(([key]) => key);

  const toUpdate = Object.entries(attrs)
    .filter(([_, val]) => val !== null)
    .map(([key, value]) => ({ key, value }));

  let conditionExpression: string = "";
  let updateExpression: string = "";
  let deleteExpression: string = "";

  const names: Record<string, string> = {};
  const values: Record<string, any> = {};

  if (!upsert) {
    Object.keys(Key).forEach((key, i) => {
      const name = `#k${i}`;
      names[name] = key;
      conditionExpression += `${conditionExpression.length > 0 ? " AND " : ""}attribute_exists(${name})`;
    });
  }

  toUpdate.forEach((attr, i) => {
    const name = `#a${i}`;
    const val = `:v${i}`;
    names[name] = attr.key;
    values[val] = attr.value;
    updateExpression += `${updateExpression.length > 0 ? ", " : ""}${name} = ${val}`;
  });

  toDelete.forEach((attr, i) => {
    const name = `#d${i}`;
    names[name] = attr;
    deleteExpression += `${deleteExpression.length > 0 ? ", " : ""}${name}`;
  });

  if (updateExpression.length === 0 && deleteExpression.length === 0) {
    throw new Error("Nothing to update");
  }

  if (updateExpression.length > 0) {
    updateExpression = "SET " + updateExpression;
  }

  if (deleteExpression.length > 0) {
    updateExpression += " REMOVE " + deleteExpression;
  }

  return new UpdateCommand({
    TableName,
    Key,
    ...(conditionExpression.length > 0 ? { ConditionExpression: conditionExpression } : undefined),
    UpdateExpression: updateExpression.trim(),
    ExpressionAttributeNames: names,
    ...(toUpdate.length > 0 ? { ExpressionAttributeValues: values } : undefined),
    ReturnValues: "ALL_NEW",
  });
};

type DeleteItem = {
  Key: Record<string, any>;
  TableName: string;
};

export const deleteItem = async <T>({ Key, TableName }: DeleteItem) => {
  const command = new DeleteCommand({ TableName, Key, ReturnValues: "ALL_OLD" });
  console.debug(JSON.stringify(command.input, null, 2));
  return createClient()
    .send(command)
    .then((response) => ({ ...response.Attributes }) as T);
};

type BatchWriteItems = {
  TableName: string;
  Items: Record<string, any>[];
};

type BatchGetItem = {
  Keys: Record<string, any>[];
  TableName: string;
};

export const batchGetItems = async <T>({ Keys, TableName }: BatchGetItem) => {
  const BATCH_SIZE = 100;
  const batches = new Array(Math.ceil(Keys.length / BATCH_SIZE))
    .fill(0)
    .map((_, i) => Keys.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE));

  const tasks = await Promise.all(
    batches.map((batch) => {
      const batchGetCommand = new BatchGetCommand({
        RequestItems: {
          [TableName]: {
            Keys: batch,
          },
        },
      });
      console.log(batchGetCommand.input);
      return createClient()
        .send(batchGetCommand)
        .then((result) => (result.Responses?.[TableName] ?? []) as T[])
        .catch((ex) => {
          console.error(ex);
          console.debug(batchGetCommand.input);
          return [] as T[];
        });
    }),
  );

  return tasks.flat();
};

type SetAction = {
  TableName: string;
  Key: Record<string, any>;
  Field: string;
  Value: any;
};

export const addToSet = async <T>({ TableName, Key, Field, Value }: SetAction) => {
  const command = new UpdateCommand({
    TableName,
    Key,
    UpdateExpression: `ADD #field :value`,
    ExpressionAttributeNames: {
      "#field": Field,
    },
    ExpressionAttributeValues: {
      ":value": new Set([Value]),
    },
    ReturnValues: "ALL_NEW",
  });
  console.debug(command.input);
  return await createClient()
    .send(command)
    .then((response) => ({ ...response.Attributes }) as T);
};

export const removeFromSet = async <T>({ TableName, Key, Field, Value }: SetAction) => {
  const command = new UpdateCommand({
    TableName,
    Key,
    UpdateExpression: `REMOVE #field :value`,
    ExpressionAttributeNames: {
      "#field": Field,
    },
    ExpressionAttributeValues: {
      ":value": new Set([Value]),
    },
    ReturnValues: "ALL_NEW",
  });
  console.debug(command.input);
  return await createClient()
    .send(command)
    .then((response) => ({ ...response.Attributes }) as T);
};

type QueryItems = {
  KeyCondition: Record<string, any>;
  TableName: string;
  IndexName?: string;
};

export const queryItems = async <T>({ KeyCondition, TableName, IndexName }: QueryItems): Promise<T[]> => {
  const input: QueryCommandInput = {
    TableName,
    IndexName,
    KeyConditionExpression: Object.keys(KeyCondition)
      .map((_, i) => `#k${i} = :v${i}`)
      .join(" AND "),
    ExpressionAttributeNames: Object.fromEntries(Object.keys(KeyCondition).map((key, i) => [`#k${i}`, key])),
    ExpressionAttributeValues: Object.fromEntries(
      Object.keys(KeyCondition).map((key, i) => [`:v${i}`, KeyCondition[key]]),
    ),
  };

  const items: T[] = [];
  const client = createClient();

  while (true) {
    console.debug(JSON.stringify(input, null, 2));
    await client.send(new QueryCommand(input)).then((response) => {
      items.push(...(response.Items as T[]));
      input.ExclusiveStartKey = response.LastEvaluatedKey;
    });

    if (!input.ExclusiveStartKey) {
      break;
    }
  }
  return items;
};

/**
 * Creates a signleton for the instance, with reusable connection pools
 * @returns
 */
export const createClient = () => {
  if (doc) {
    return doc;
  }

  const endpoint = process.env.DYNAMODB_ENDPOINT;
  client = new DynamoDBClient(endpoint && endpoint !== "" ? { endpoint, region: "eu-west-1", accountId: "" } : {});
  doc = DynamoDBDocumentClient.from(client, {
    marshallOptions: { removeUndefinedValues: true },
    unmarshallOptions: { wrapNumbers: false },
  });

  return doc;
};
