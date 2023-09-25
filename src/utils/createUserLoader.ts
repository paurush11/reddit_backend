import DataLoader from "dataloader";
import { User } from "../entities/User";
import testUser from "./sampleTestUser";

export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);

    const userIdToUse: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUse[u._id] = u;
    });
    userIds.map((userId) => {
      const user = userIdToUse[userId];
      if (!user) {
        userIdToUse[userId] = testUser;
      }
    });
    return userIds.map((userId) => userIdToUse[userId]);
  });
