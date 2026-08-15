import { getUserQQS, type UserStatus } from "../minesweeper/api";

const cache: Record<number, { user: UserStatus; date: number }> = {};

const CACHE_DURATION = 60_000;

export const getUserStatus = async (userId: number): Promise<UserStatus | undefined> => {
  const cached = cache[userId];
  if (cached && Date.now() - cached.date < CACHE_DURATION) {
    return cached.user;
  }

  const user = await getUserQQS(userId);

  if (user) {
    cache[userId] = {
      user,
      date: Date.now(),
    };
  }

  return user;
};
