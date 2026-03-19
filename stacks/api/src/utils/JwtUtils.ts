import jwt from "jsonwebtoken";

const tmpSecret = crypto.randomUUID();

const verify = (token: string) => {
  return jwt.verify(token, tmpSecret);
};

const create = (userId: number, name: string) => {
  return jwt.sign(
    {
      sub: userId,
      name,
      iss: "https://flotto.vercel.app",
    },
    tmpSecret,
    { expiresIn: "180 days" },
  );
};

export default {
  verify,
  create,
};
