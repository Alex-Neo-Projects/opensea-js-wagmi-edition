"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assetBundleSchema = exports.accountSchema = void 0;
const userSchema = {
    type: "object",
    properties: {
        username: { type: "string", nullable: true },
    },
};
exports.accountSchema = {
    type: "object",
    properties: {
        address: { type: "string" },
        config: { type: "string" },
        profileImgUrl: { type: "string" },
        user: Object.assign(Object.assign({}, userSchema), { nullable: true }),
    },
    required: ["address", "config", "profileImgUrl", "user"],
};
exports.assetBundleSchema = {
    type: "object",
    properties: {
        maker: Object.assign(Object.assign({}, exports.accountSchema), { nullable: true }),
        assets: { type: "array", items: { type: "object" } },
        name: { type: "string", nullable: true },
        slug: { type: "string", nullable: true },
        permalink: { type: "string", nullable: false },
        sellOrders: {
            type: "array",
            items: { type: "object" },
            nullable: true,
        },
        assetContract: { type: "object", nullable: true },
        description: { type: "string", nullable: true },
        externalLink: { type: "string", nullable: true },
    },
    required: ["maker", "assets", "name", "slug", "permalink", "sellOrders"],
};
