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
const Post_1 = require("../entities/Post");
let PostResolver = exports.PostResolver = class PostResolver {
    async posts() {
        return Post_1.Post.find();
    }
    post(id) {
        return Post_1.Post.findOne({
            where: {
                _id: id,
            },
        });
    }
    async createPost(title) {
        const post = await Post_1.Post.create({
            title: title,
        }).save();
        return post;
    }
    async deletePost(id) {
        try {
            await Post_1.Post.delete({
                _id: id,
            });
        }
        catch (error) {
            return false;
        }
        return true;
    }
    async updatePost(title, id) {
        const post = await Post_1.Post.findOne({
            where: {
                _id: id,
            },
        });
        if (!post) {
            return null;
        }
        if (typeof title !== "undefined") {
            await Post_1.Post.update({ _id: id }, { title });
        }
        return post;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => [Post_1.Post]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
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
    __param(0, (0, type_graphql_1.Arg)("Title")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "createPost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("Identifier")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "deletePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Post_1.Post, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("Title", () => String, { nullable: true })),
    __param(1, (0, type_graphql_1.Arg)("Identifier")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], PostResolver.prototype, "updatePost", null);
exports.PostResolver = PostResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], PostResolver);
//# sourceMappingURL=post.js.map