"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResolver = void 0;
const type_graphql_1 = require("type-graphql");
const dataSource_1 = require("../dataSource");
const Post_1 = require("../entities/Post");
const UpVotes_1 = require("../entities/UpVotes");
const User_1 = require("../entities/User");
const isAuth_1 = require("../middleware/isAuth");
const Comments_1 = require("../entities/Comments");
const createPostLoader_1 = require("../utils/createPostLoader");
let PostInput = class PostInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostInput.prototype, "title", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], PostInput.prototype, "text", void 0);
PostInput = __decorate([
    (0, type_graphql_1.InputType)()
], PostInput);
let PaginatedPosts = class PaginatedPosts {
};
__decorate([
    (0, type_graphql_1.Field)(() => [Post_1.Post]),
    __metadata("design:type", Array)
], PaginatedPosts.prototype, "Posts", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PaginatedPosts.prototype, "hasMore", void 0);
PaginatedPosts = __decorate([
    (0, type_graphql_1.ObjectType)()
], PaginatedPosts);
let PostResolver = exports.PostResolver = class PostResolver {
    creator(post, ctx) {
        return ctx.userLoader.load(post.creatorId);
    }
    async comments(post) {
        return await Comments_1.PostComments.find({ where: { postId: post._id } });
    }
    async voteStatus(post, ctx) {
        const up_vote = await ctx.upVotesLoader.load({
            userId: ctx.req.session.user,
            postId: post._id,
        });
        return up_vote === null || up_vote === void 0 ? void 0 : up_vote.value;
    }
    async myPosts(limit, cursor, ctx) {
        const userId = ctx.req.session.user;
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const replaceableValues = [realLimitPlusOne, userId];
        if (cursor) {
            replaceableValues.push(new Date(Date.parse(cursor)));
        }
        const posts = await dataSource_1.AppDataSource.getRepository(Post_1.Post).query(`
    select p.*
    from post p
    ${cursor
            ? ` WHERE  p."createdAt" < $3 and p."creatorId" = $2`
            : ` WHERE p."creatorId" = $2`}
    order by p."createdAt" DESC
    limit $1`, replaceableValues);
        posts.forEach((post) => {
            post.createdAt = new Date(post.createdAt);
            post.updatedAt = new Date(post.updatedAt);
            if (post.creator) {
                post.creator.createdAt = new Date(post.creator.createdAt);
                post.creator.updatedAt = new Date(post.creator.updatedAt);
            }
        });
        return {
            Posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }
    async posts(limit, cursor) {
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const replaceableValues = [realLimitPlusOne];
        if (cursor) {
            replaceableValues.push(new Date(Date.parse(cursor)));
        }
        const posts = await dataSource_1.AppDataSource.getRepository(Post_1.Post).query(`
    select p.*
    from post p
    ${cursor ? ` WHERE  p."createdAt" < $2` : ""}
    order by p."createdAt" DESC
    limit $1`, replaceableValues);
        posts.forEach((post) => {
            post.createdAt = new Date(post.createdAt);
            post.updatedAt = new Date(post.updatedAt);
            if (post.creator) {
                post.creator.createdAt = new Date(post.creator.createdAt);
                post.creator.updatedAt = new Date(post.creator.updatedAt);
            }
        });
        return {
            Posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }
    async post(id) {
        const postId = id;
        const post = await dataSource_1.AppDataSource.getRepository(Post_1.Post).query(`
    select p.* 
    from post p
    where p._id = $1`, [postId]);
        post.forEach((post) => {
            post.createdAt = new Date(post.createdAt);
            post.updatedAt = new Date(post.updatedAt);
            if (post.creator) {
                post.creator.createdAt = new Date(post.creator.createdAt);
                post.creator.updatedAt = new Date(post.creator.updatedAt);
            }
        });
        return post[0];
    }
    async createPost(input, ctx) {
        return Post_1.Post.create(Object.assign(Object.assign({}, input), { creatorId: ctx.req.session.user })).save();
    }
    async deletePost(id, ctx) {
        try {
            const post = await Post_1.Post.findOne({
                where: {
                    _id: id,
                },
            });
            if (!post) {
                return false;
            }
            if (post.creatorId !== ctx.req.session.user)
                throw Error("Unauthorized User!!");
            await UpVotes_1.UpVotes.delete({
                postId: id,
            });
            await Post_1.Post.delete({
                _id: id,
            });
        }
        catch (error) {
            return false;
        }
        return true;
    }
    async updatePost(id, title, text, ctx) {
        const result = dataSource_1.AppDataSource.getRepository(Post_1.Post)
            .createQueryBuilder()
            .update(Post_1.Post)
            .set({ title, text })
            .where(`_id = :id and "creatorId"= :creatorId`, {
            id,
            creatorId: ctx.req.session.user,
        })
            .returning("*")
            .execute();
        console.log(result);
        return (await result).raw[0];
    }
    async hidePost(ctx, id) {
        const post = await Post_1.Post.findOne({
            where: {
                _id: id,
            },
        });
        if (post) {
            if (!post.hiddenBy) {
                post.hiddenBy = [ctx.req.session.user];
            }
            else {
                post.hiddenBy.push(ctx.req.session.user);
            }
            await post.save();
        }
        else {
            return false;
        }
        return true;
    }
    async unHidePost(ctx, id) {
        const post = await Post_1.Post.findOne({
            where: {
                _id: id,
            },
        });
        if (post) {
            post.hiddenBy = post.hiddenBy.filter((p) => p !== ctx.req.session.user);
            await post.save();
        }
        else {
            return false;
        }
        return true;
    }
    async getHiddenPosts(limit, cursor, ctx) {
        const userId = ctx.req.session.user;
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const replaceableValues = [realLimitPlusOne, userId];
        if (cursor) {
            replaceableValues.push(new Date(Date.parse(cursor)));
        }
        const allPost = await Post_1.Post.find({});
        const postLoader = (0, createPostLoader_1.createPostLoader)();
        const postIds = allPost
            .filter((post) => post.hiddenBy && post.hiddenBy.includes(ctx.req.session.user))
            .map((p) => p._id);
        const postPromise = await postIds.map(async (id) => {
            return postLoader.load(id);
        });
        const posts = await Promise.all(postPromise);
        return {
            Posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }
    async getSavedPosts(limit, cursor, ctx) {
        const userId = ctx.req.session.user;
        const realLimit = Math.min(50, limit);
        const realLimitPlusOne = realLimit + 1;
        const replaceableValues = [realLimitPlusOne, userId];
        if (cursor) {
            replaceableValues.push(new Date(Date.parse(cursor)));
        }
        const allPost = await Post_1.Post.find({});
        const postLoader = (0, createPostLoader_1.createPostLoader)();
        const postIds = allPost
            .filter((post) => post.savedBy && post.savedBy.includes(ctx.req.session.user))
            .map((p) => p._id);
        const postPromise = await postIds.map(async (id) => {
            return postLoader.load(id);
        });
        const posts = await Promise.all(postPromise);
        return {
            Posts: posts.slice(0, realLimit),
            hasMore: posts.length === realLimitPlusOne,
        };
    }
    async savePost(ctx, postId) {
        const post = await Post_1.Post.findOne({
            where: {
                _id: postId,
            },
        });
        if (!post) {
            return false;
        }
        if (!post.savedBy) {
            post.savedBy = [ctx.req.session.user];
        }
        else {
            post.savedBy.push(ctx.req.session.user);
        }
        await post.save();
        return true;
    }
    async deleteSavedPost(ctx, postId) {
        const post = await Post_1.Post.findOne({
            where: {
                _id: postId,
            },
        });
        if (post) {
            post.savedBy = post.savedBy.filter((p) => p !== ctx.req.session.user);
            await post.save();
        }
        else {
            return false;
        }
        return true;
    }
};
__decorate([
    (0, type_graphql_1.FieldResolver)(() => User_1.User),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "creator", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => [Comments_1.PostComments]),
    __param(0, (0, type_graphql_1.Root)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "comments", null);
__decorate([
    (0, type_graphql_1.FieldResolver)(() => type_graphql_1.Int, { nullable: true }),
    __param(0, (0, type_graphql_1.Root)()),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Post_1.Post, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "voteStatus", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)("limit")),
    __param(1, (0, type_graphql_1.Arg)("cursor", () => String, { nullable: true })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "myPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    __param(0, (0, type_graphql_1.Arg)("limit")),
    __param(1, (0, type_graphql_1.Arg)("cursor", () => String, { nullable: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "posts", null);
__decorate([
    (0, type_graphql_1.Query)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("identifier", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "post", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("input")),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [PostInput, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __param(1, (0, type_graphql_1.Arg)("Title", () => String, { nullable: true })),
    __param(2, (0, type_graphql_1.Arg)("Text", () => String, { nullable: true })),
    __param(3, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "hidePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("id", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "unHidePost", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("limit")),
    __param(1, (0, type_graphql_1.Arg)("cursor", () => String, { nullable: true })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getHiddenPosts", null);
__decorate([
    (0, type_graphql_1.Query)(() => PaginatedPosts),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Arg)("limit")),
    __param(1, (0, type_graphql_1.Arg)("cursor", () => String, { nullable: true })),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "getSavedPosts", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "savePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deleteSavedPost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)(() => Post_1.Post)
], PostResolver);
//# sourceMappingURL=post.js.map