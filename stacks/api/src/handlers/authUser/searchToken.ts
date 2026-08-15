import jwt from "jsonwebtoken";
import TokenUtils from "../../utils/TokenUtils";

export const generateSearchToken = async () => {
  return Promise.all([TokenUtils.getToken("bot"), TokenUtils.getSecret()]).then(([token, secret]) => {
    return jwt.sign(
      {
        sub: "search",
        ...token,
        iss: "https://flotto.vercel.app",
      },
      secret,
      { expiresIn: "1 hour" },
    );
  });
};

export const validateSearchToken = async (token?: string) => {
  console.log(token);

  if (!token) {
    return false;
  }

  token = token.replace("Bearer ", "");
  const secret = await TokenUtils.getSecret();
  const claims = jwt.verify(token, secret);
  console.log("claims", claims);
  return Boolean(claims?.sub === "search");
};
