import { User } from "../entities/User"

const testUser = new User()
testUser._id = -1
testUser.email = ""
testUser.password = ""
testUser.posts = []
testUser.upVotes = []
testUser.username = "Deleted User"
testUser.updatedAt = new Date()
testUser.createdAt = new Date()

export default testUser;