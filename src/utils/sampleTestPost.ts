import { Post } from "../entities/Post";
import testUser from "./sampleTestUser";

const testPost = new Post();
testPost.title = "";
testPost.text = "";
testPost._id = -1;
testPost.creator = testUser;
testPost.creatorId = -1;
testPost.points = 0;
testPost.voteStatus = null;
testPost.updatedAt = new Date();
testPost.createdAt = new Date();
testPost.upVotes = [];

export default testPost;
