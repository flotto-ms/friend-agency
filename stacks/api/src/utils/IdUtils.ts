const charset = "abcdefghijklmnopqrstuvwxyz0123456789";

const createId = (length: number = 8) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};
export default {
  createId,
};
