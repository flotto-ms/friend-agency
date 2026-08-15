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

const noContent = (message: string = "No Content") => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message }),
  };
};
export default {
  unauthorised,
  notFound,
  noContent,
};
