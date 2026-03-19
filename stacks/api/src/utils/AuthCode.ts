const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXQZ";

export const generateCode = () => {
  let code = "";
  while (code.length < 7) {
    if (code.length === 3) {
      code += "-";
    } else {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return code;
};
