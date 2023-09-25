import { User } from "../entities/User";
import testPost from "./sampleTestPost";

const testUser = new User();
testUser._id = -1;
testUser.email = "";
testUser.password = "";
testUser.posts = [testPost];
testUser.upVotes = [];
testUser.username = "Deleted User";
testUser.updatedAt = new Date();
testUser.createdAt = new Date();

export default testUser;
