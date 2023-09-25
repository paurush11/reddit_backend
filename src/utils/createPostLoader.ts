import DataLoader from "dataloader";
import { Post } from "../entities/Post";
import testPost from "./sampleTestPost";

export const createPostLoader = () =>
  new DataLoader<number, Post>(async (postIds) => {
    const users = await Post.findByIds(postIds as number[]);

    const postIdToUse: Record<number, Post> = {};
    users.forEach((u) => {
      postIdToUse[u._id] = u;
    });
    postIds.map((postId) => {
      const post = postIdToUse[postId];
      if (!post) {
        postIdToUse[postId] = testPost;
      }
    });
    return postIds.map((postId) => postIdToUse[postId]);
  });
