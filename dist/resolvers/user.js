"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.UserResolver = void 0;
const argon2_1 = __importDefault(require("argon2"));
const User_1 = require("../entities/User");
const type_graphql_1 = require("type-graphql");
const constants_1 = require("../constants");
const UserNameOrEmailPassword_1 = require("../utils/UserNameOrEmailPassword");
const validate_1 = require("../utils/validate");
const sendEmail_1 = require("../utils/sendEmail");
const crypto = __importStar(require("crypto"));
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => User_1.User, { nullable: true }),
    __metadata("design:type", User_1.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = exports.UserResolver = class UserResolver {
    async Me(ctx) {
        if (!ctx.req.session.user) {
            return null;
        }
        const user = await User_1.User.findOne({
            where: {
                _id: ctx.req.session.user,
            },
        });
        return user;
    }
    async register(ctx, options) {
        const hashedPassword = await argon2_1.default.hash(options.password);
        const errors = (0, validate_1.validate)(options);
        if (errors) {
            return { errors };
        }
        const user = await User_1.User.create({
            email: options.email,
            username: options.username,
            password: hashedPassword,
        });
        try {
            await user.save();
        }
        catch (err) {
            console.log(err);
            if (err.code === "23505" || err.details.includes("already exists")) {
                return {
                    errors: [
                        {
                            field: "username",
                            message: "Duplicate User Exits",
                        },
                    ],
                };
            }
        }
        ctx.req.session.user = user._id;
        return { user };
    }
    async changePassword(newPassword, token, ctx) {
        if (newPassword.length <= 3) {
            return {
                errors: [
                    {
                        field: "newPassword",
                        message: "Password is too short!",
                    },
                ],
            };
        }
        const key = constants_1.FORGOT_PASSWORD + token;
        const userId = (await ctx.redis.get(key));
        const user = await User_1.User.findOne({
            where: {
                _id: parseInt(userId),
            },
        });
        if (!user) {
            return {
                errors: [
                    {
                        field: "token",
                        message: "No such user Exist!",
                    },
                ],
            };
        }
        const hashedPassword = await argon2_1.default.hash(newPassword);
        await User_1.User.update({ _id: parseInt(userId) }, { password: hashedPassword });
        await ctx.redis.del(key);
        ctx.req.session.user = parseInt(userId);
        return { user };
    }
    async forgotPassword(ctx, UserNameOrEmail) {
        const user = await User_1.User.findOne({
            where: UserNameOrEmail.includes("@")
                ? {
                    email: UserNameOrEmail,
                }
                : {
                    username: UserNameOrEmail,
                },
        });
        if (!user) {
            console.log("wrong");
            return true;
        }
        const token = crypto.randomUUID();
        await ctx.redis.set(constants_1.FORGOT_PASSWORD + token, user._id, "EX", 1000 * 60 * 60 * 24 * 3);
        console.log(`http://localhost:3000/change-password/${token}`);
        await (0, sendEmail_1.sendEmail)(user.email, `<a href='http://localhost:3000/change-password/${token}'>Reset Password</a>`);
        return true;
    }
    async login(ctx, UserNameOrEmail, password) {
        const user = await User_1.User.findOne({
            where: UserNameOrEmail.includes("@")
                ? {
                    email: UserNameOrEmail,
                }
                : {
                    username: UserNameOrEmail,
                },
        });
        if (!user) {
            return {
                errors: [
                    {
                        field: "usernameOrEmail",
                        message: "User Not Found",
                    },
                ],
            };
        }
        const valid = await argon2_1.default.verify(user.password, password);
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "Incorrect Password",
                    },
                ],
            };
        }
        ctx.req.session.user = user._id;
        return { user };
    }
    logout(ctx) {
        return new Promise((resolve) => ctx.req.session.destroy((err) => {
            ctx.res.clearCookie(constants_1.COOKIE_NAME);
            if (err) {
                console.log(err);
                resolve(err);
                return false;
            }
            resolve(true);
            return true;
        }));
    }
    users() {
        return User_1.User.find({});
    }
    async delete(options) {
        try {
            await User_1.User.delete({
                username: options,
            });
        }
        catch (error) {
            return false;
        }
        return true;
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => User_1.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "Me", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse, { nullable: false }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UserNameOrEmailPassword_1.UserNameOrEmailPassword]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse),
    __param(0, (0, type_graphql_1.Arg)("newPassword")),
    __param(1, (0, type_graphql_1.Arg)("token")),
    __param(2, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "changePassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("UserNameOrEmail")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "forgotPassword", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse, { nullable: false }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __param(1, (0, type_graphql_1.Arg)("UserNameOrEmail")),
    __param(2, (0, type_graphql_1.Arg)("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UserResolver.prototype, "logout", null);
__decorate([
    (0, type_graphql_1.Query)(() => [User_1.User]),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "users", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => Boolean, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)("options")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "delete", null);
exports.UserResolver = UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
//# sourceMappingURL=user.js.map