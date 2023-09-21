import DataLoader from "dataloader";
import { User } from "../entities/User";

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUse: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUse[u._id] = u;
    });
    return userIds.map((userId) => userIdToUse[userId]);
  });
