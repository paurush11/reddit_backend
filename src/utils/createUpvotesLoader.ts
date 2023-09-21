import DataLoader from "dataloader";

import { UpVotes } from "../entities/UpVotes";

export const createUpVotesLoader = () =>
  new DataLoader<{ userId: number; postId: number }, UpVotes>(async (keys) => {
    const upVotes = await UpVotes.findByIds(keys as any);
    const userIdToUse: Record<string, UpVotes> = {};
    upVotes.forEach((up_votes) => {
      userIdToUse[`${up_votes.userId}|${up_votes.postId}`] = up_votes;
    });
    return keys.map(
      (up_votes) => userIdToUse[`${up_votes.userId}|${up_votes.postId}`],
    );
  });
