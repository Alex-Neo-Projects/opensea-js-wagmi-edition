"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrder = void 0;
const ajv_1 = __importDefault(require("ajv"));
const schemas_1 = require("../schemas");
const ajv = new ajv_1.default();
const feeSchema = {
    type: "object",
    properties: {
        account: schemas_1.accountSchema,
        basisPoints: { type: "string" },
    },
    required: ["account", "basisPoints"],
};
const orderSchema = {
    type: "object",
    properties: {
        createdDate: { type: "string" },
        closingDate: { type: "string", nullable: true },
        listingTime: { type: "number" },
        expirationTime: { type: "number" },
        orderHash: { type: "string", nullable: true },
        maker: schemas_1.accountSchema,
        taker: Object.assign(Object.assign({}, schemas_1.accountSchema), { nullable: true }),
        protocolData: { type: "object" },
        protocolAddress: { type: "string" },
        currentPrice: { type: "string" },
        makerFees: { type: "array", items: feeSchema },
        takerFees: { type: "array", items: feeSchema },
        side: { type: "string" },
        orderType: { type: "string" },
        cancelled: { type: "boolean" },
        finalized: { type: "boolean" },
        markedInvalid: { type: "boolean" },
        clientSignature: { type: "string", nullable: true },
        makerAssetBundle: schemas_1.assetBundleSchema,
        takerAssetBundle: schemas_1.assetBundleSchema,
    },
    required: [
        "createdDate",
        "closingDate",
        "listingTime",
        "expirationTime",
        "orderHash",
        "maker",
        "taker",
        "protocolData",
        "protocolAddress",
        "currentPrice",
        "makerFees",
        "takerFees",
        "side",
        "orderType",
        "cancelled",
        "finalized",
        "markedInvalid",
        "clientSignature",
        "makerAssetBundle",
        "takerAssetBundle",
    ],
};
// TODO: Remove cast once all schemas are written
exports.validateOrder = ajv.compile(orderSchema);
