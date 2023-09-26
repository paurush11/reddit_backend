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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedPostResolver = void 0;
const SavedPost_1 = require("../entities/SavedPost");
const type_graphql_1 = require("type-graphql");
const isAuth_1 = require("../middleware/isAuth");
const sampleSavedPost_1 = __importDefault(require("../utils/sampleSavedPost"));
let SavedPostResolver = exports.SavedPostResolver = class SavedPostResolver {
    async getSavedPosts(ctx, postId) {
        const post = await SavedPost_1.SavedPost.findOne({
            where: {
                userId: ctx.req.session.user,
                postId: postId,
            },
        });
        if (!post)
            return sampleSavedPost_1.default;
        console.log(post);
        return post;
    }
    async savePost(ctx, postId) {
        const isPostSaved = await SavedPost_1.SavedPost.findOne({
            where: {
                userId: ctx.req.session.user,
                postId: postId,
            },
        });
        if (isPostSaved)
            return false;
        try {
            SavedPost_1.SavedPost.create({
                userId: ctx.req.session.user,
                postId: postId,
            }).save();
        }
        catch (e) {
            return false;
        }
        return true;
    }
    async deleteSavedPost(ctx, postId) {
        const isPostSaved = await SavedPost_1.SavedPost.findOne({
            where: {
                userId: ctx.req.session.user,
                postId: postId,
            },
        });
        if (!isPostSaved)
            return false;
        const res = await SavedPost_1.SavedPost.delete({
            userId: ctx.req.session.user,
            postId: postId,
        });
        console.log(res);
        return true;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => SavedPost_1.SavedPost),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SavedPostResolver.prototype, "getSavedPosts", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SavedPostResolver.prototype, "savePost", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    (0, type_graphql_1.UseMiddleware)(isAuth_1.isAuth),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("postId", () => type_graphql_1.Int)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], SavedPostResolver.prototype, "deleteSavedPost", null);
exports.SavedPostResolver = SavedPostResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], SavedPostResolver);
//# sourceMappingURL=savePost.js.map