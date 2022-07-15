"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../support/setup");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const web3_1 = __importDefault(require("web3"));
const constants_1 = require("../../constants");
const index_1 = require("../../index");
const types_1 = require("../../types");
const constants_2 = require("../constants");
const utils_1 = require("../utils");
// Client setup
const rinkebyProvider = new web3_1.default.providers.HttpProvider(constants_1.RINKEBY_PROVIDER_URL);
const rinkebyClient = new index_1.OpenSeaSDK(rinkebyProvider, {
    networkName: types_1.Network.Rinkeby,
    apiKey: constants_2.RINKEBY_API_KEY,
});
(0, mocha_1.suite)("Getting orders", () => {
    ["ask", "bid"].forEach((side) => {
        (0, mocha_1.test)(`getOrder should return a single order > ${side}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const order = yield rinkebyClient.api.getOrder({
                protocol: "seaport",
                side: "ask",
            });
            (0, utils_1.expectValidOrder)(order);
        }));
    });
    (0, mocha_1.test)(`getOrder should throw if no order found`, () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, chai_1.expect)(rinkebyClient.api.getOrder({
            protocol: "seaport",
            side: "ask",
            maker: "0x000000000000000000000000000000000000dEaD",
        }))
            .to.eventually.be.rejected.and.be.an.instanceOf(Error)
            .and.have.property("message", "Not found: no matching order found");
    }));
    ["ask", "bid"].forEach((side) => {
        (0, mocha_1.test)(`getOrders should return a list of orders > ${side}`, () => __awaiter(void 0, void 0, void 0, function* () {
            const { orders, next, previous } = yield rinkebyClient.api.getOrders({
                protocol: "seaport",
                side: "ask",
            });
            orders.map((order) => (0, utils_1.expectValidOrder)(order));
            (0, chai_1.expect)(next).to.not.be.undefined;
            (0, chai_1.expect)(previous).to.not.be.undefined;
        }));
    });
});
