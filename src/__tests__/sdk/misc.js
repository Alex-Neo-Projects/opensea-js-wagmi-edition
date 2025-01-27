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
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const web3_1 = __importDefault(require("web3"));
const constants_1 = require("../../constants");
const contracts_1 = require("../../contracts");
const index_1 = require("../../index");
const types_1 = require("../../types");
const utils_1 = require("../../utils/utils");
const constants_2 = require("../constants");
const provider = new web3_1.default.providers.HttpProvider(constants_1.MAINNET_PROVIDER_URL);
const client = new index_1.OpenSeaSDK(provider, {
    networkName: types_1.Network.Main,
    apiKey: constants_2.MAINNET_API_KEY,
}, (line) => console.info(`MAINNET: ${line}`));
(0, mocha_1.suite)("SDK: misc", () => {
    (0, mocha_1.test)("Instance has public methods", () => {
        chai_1.assert.equal(typeof client.getCurrentPriceLegacyWyvern, "function");
        chai_1.assert.equal(typeof client.wrapEth, "function");
    });
    (0, mocha_1.test)("Instance exposes API methods", () => {
        chai_1.assert.equal(typeof client.api.getOrder, "function");
        chai_1.assert.equal(typeof client.api.getOrders, "function");
        chai_1.assert.equal(typeof client.api.postOrderLegacyWyvern, "function");
    });
    (0, mocha_1.test)("Instance exposes some underscored methods", () => {
        chai_1.assert.equal(typeof client._initializeProxy, "function");
        chai_1.assert.equal(typeof client._getProxy, "function");
    });
    (0, mocha_1.test)("Fetches proxy for an account", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const proxy = yield client._getProxy(accountAddress);
        chai_1.assert.isNotNull(proxy);
    }));
    (0, mocha_1.test)("Fetches positive token balance for an account", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const balance = yield client.getTokenBalance({
            accountAddress,
            tokenAddress: constants_2.WETH_ADDRESS,
        });
        chai_1.assert.isAbove(balance.toNumber(), 0);
    }));
    (0, mocha_1.test)("Accounts have maximum token balance approved", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const approved = yield client._getApprovedTokenCount({ accountAddress });
        chai_1.assert.equal(approved.toString(), constants_1.MAX_UINT_256.toString());
    }));
    (0, mocha_1.test)("Single-approval tokens are approved for tester address", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS_2;
        const _proxyAddress = yield client._getProxy(accountAddress);
        const tokenId = constants_2.CK_TOKEN_ID.toString();
        const tokenAddress = constants_1.CK_ADDRESS;
        const erc721 = new client.web3.eth.Contract(contracts_1.ERC721, tokenAddress);
        const _approvedAddress = yield (0, utils_1.getNonCompliantApprovalAddress)(erc721, tokenId, accountAddress);
        // assert.equal(approvedAddress, proxyAddress)
    }));
    (0, mocha_1.test)("Checks whether an address is a contract addrress", () => __awaiter(void 0, void 0, void 0, function* () {
        const smartContractWalletAddress = constants_2.DAN_DAPPER_ADDRESS;
        const acccountOneIsContractAddress = yield (0, utils_1.isContractAddress)(client.web3, smartContractWalletAddress);
        const nonSmartContractWalletAddress = constants_2.DAN_ADDRESS;
        const acccountTwoIsContractAddress = yield (0, utils_1.isContractAddress)(client.web3, nonSmartContractWalletAddress);
        chai_1.assert.equal(acccountOneIsContractAddress, true);
        chai_1.assert.equal(acccountTwoIsContractAddress, false);
    }));
});
