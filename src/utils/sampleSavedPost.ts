import { SavedPost } from "../entities/SavedPost";
import testUser from "./sampleTestUser";
import testPost from "./sampleTestPost";

const testSavedPost = new SavedPost();

testSavedPost._id = -1;
testSavedPost.post = testPost;
testSavedPost.user = testUser;
testSavedPost.userId = -1;
testSavedPost.postId = -1;

export default testSavedPost;
