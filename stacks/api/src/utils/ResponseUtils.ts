const unauthorised = (message: string) => {
  return {
    statusCode: 403,
    body: JSON.stringify({ message }),
  };
};
const notFound = (message: string) => {
  return {
    statusCode: 404,
    body: JSON.stringify({ message }),
  };
};

const badRequest = (message: string) => {
  return {
    statusCode: 400,
    body: JSON.stringify({ message }),
  };
};

const noContent = (message: string = "No Content") => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message }),
  };
};

const json = (data: object) => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
};

export default {
  unauthorised,
  badRequest,
  notFound,
  noContent,
  json,
};
