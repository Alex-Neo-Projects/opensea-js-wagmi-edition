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
const index_1 = require("../../index");
const types_1 = require("../../types");
const constants_2 = require("../constants");
const provider = new web3_1.default.providers.HttpProvider(constants_1.MAINNET_PROVIDER_URL);
const rinkebyProvider = new web3_1.default.providers.HttpProvider(constants_1.RINKEBY_PROVIDER_URL);
const client = new index_1.OpenSeaSDK(provider, {
    networkName: types_1.Network.Main,
    apiKey: constants_2.MAINNET_API_KEY,
}, (line) => console.info(`MAINNET: ${line}`));
const rinkebyClient = new index_1.OpenSeaSDK(rinkebyProvider, {
    networkName: types_1.Network.Rinkeby,
    apiKey: constants_2.RINKEBY_API_KEY,
}, (line) => console.info(`RINKEBY: ${line}`));
let manaAddress;
(0, mocha_1.suite)("SDK: owners and transfers", () => {
    (0, mocha_1.before)(() => __awaiter(void 0, void 0, void 0, function* () {
        manaAddress = (yield client.api.getPaymentTokens({ symbol: "MANA" }))
            .tokens[0].address;
    }));
    (0, mocha_1.test)("On-chain ownership throws for invalid assets", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const schemaName = types_1.WyvernSchemaName.ERC721;
        const wyAssetRinkeby = {
            id: constants_2.CK_RINKEBY_TOKEN_ID.toString(),
            address: constants_2.CK_RINKEBY_ADDRESS,
        };
        try {
            // Use mainnet client with rinkeby asset
            const _isOwner = yield client._ownsAssetOnChain({
                accountAddress,
                wyAsset: wyAssetRinkeby,
                schemaName,
            });
            chai_1.assert.fail();
        }
        catch (error) {
            chai_1.assert.include(error.message, "Unable to get current owner");
        }
    }));
    (0, mocha_1.test)("On-chain ownership correctly pulled for ERC721s", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const schemaName = types_1.WyvernSchemaName.ERC721;
        // Ownership
        const wyAsset = {
            id: constants_2.MYTHEREUM_TOKEN_ID.toString(),
            address: constants_2.MYTHEREUM_ADDRESS,
        };
        const isOwner = yield client._ownsAssetOnChain({
            accountAddress,
            wyAsset,
            schemaName,
        });
        chai_1.assert.isTrue(isOwner);
        // Non-ownership
        const isOwner2 = yield client._ownsAssetOnChain({
            accountAddress: constants_2.ALEX_ADDRESS_2,
            wyAsset,
            schemaName,
        });
        chai_1.assert.isFalse(isOwner2);
    }));
    (0, mocha_1.test)("On-chain ownership correctly pulled for ERC20s", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const schemaName = types_1.WyvernSchemaName.ERC20;
        // Ownership
        const wyAsset = {
            address: manaAddress,
            quantity: "1",
        };
        const isOwner = yield client._ownsAssetOnChain({
            accountAddress,
            wyAsset,
            schemaName,
        });
        chai_1.assert.isTrue(isOwner);
        // Not enough ownership
        const isOwner2 = yield client._ownsAssetOnChain({
            accountAddress,
            wyAsset: Object.assign(Object.assign({}, wyAsset), { quantity: constants_1.MAX_UINT_256.toString() }),
            schemaName,
        });
        chai_1.assert.isFalse(isOwner2);
        // Non-ownership
        const isOwner3 = yield client._ownsAssetOnChain({
            accountAddress: constants_2.RANDOM_ADDRESS,
            wyAsset,
            schemaName,
        });
        chai_1.assert.isFalse(isOwner3);
    }));
    (0, mocha_1.test)("On-chain ownership correctly pulled for ERC1155s", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const schemaName = types_1.WyvernSchemaName.ERC1155;
        // Ownership of NFT
        const wyAssetNFT = {
            id: constants_2.AGE_OF_RUST_TOKEN_ID,
            address: constants_1.ENJIN_ADDRESS,
        };
        const isOwner = yield client._ownsAssetOnChain({
            accountAddress,
            wyAsset: wyAssetNFT,
            schemaName,
        });
        chai_1.assert.isTrue(isOwner);
        // Non-ownership
        const isOwner2 = yield client._ownsAssetOnChain({
            accountAddress: constants_2.RANDOM_ADDRESS,
            wyAsset: wyAssetNFT,
            schemaName,
        });
        chai_1.assert.isFalse(isOwner2);
        // Ownership of FT
        const wyAssetFT = {
            id: constants_2.DISSOLUTION_TOKEN_ID,
            address: constants_1.ENJIN_ADDRESS,
            quantity: "1",
        };
        const isOwner3 = yield client._ownsAssetOnChain({
            accountAddress,
            wyAsset: wyAssetFT,
            schemaName,
        });
        chai_1.assert.isTrue(isOwner3);
        // Not enough ownership
        const isOwner5 = yield client._ownsAssetOnChain({
            accountAddress,
            wyAsset: Object.assign(Object.assign({}, wyAssetFT), { quantity: constants_1.MAX_UINT_256.toString() }),
            schemaName,
        });
        chai_1.assert.isFalse(isOwner5);
        // Non-ownership
        const isOwner4 = yield client._ownsAssetOnChain({
            accountAddress: constants_2.RANDOM_ADDRESS,
            wyAsset: wyAssetFT,
            schemaName,
        });
        chai_1.assert.isFalse(isOwner4);
    }));
    (0, mocha_1.test)("ERC-721v2 asset locked in contract is not transferrable", () => __awaiter(void 0, void 0, void 0, function* () {
        const isTransferrable = yield client.isAssetTransferrable({
            asset: {
                tokenId: constants_2.GODS_UNCHAINED_TOKEN_ID.toString(),
                tokenAddress: constants_2.GODS_UNCHAINED_ADDRESS,
            },
            fromAddress: constants_2.ALEX_ADDRESS,
            toAddress: constants_2.ALEX_ADDRESS_2,
        });
        chai_1.assert.isNotTrue(isTransferrable);
    }));
    (0, mocha_1.test)("ERC-721v3 asset locked in contract is not transferrable", () => __awaiter(void 0, void 0, void 0, function* () {
        const isTransferrable = yield client.isAssetTransferrable({
            asset: {
                tokenId: constants_2.GODS_UNCHAINED_TOKEN_ID.toString(),
                tokenAddress: constants_2.GODS_UNCHAINED_ADDRESS,
                schemaName: types_1.WyvernSchemaName.ERC721v3,
            },
            fromAddress: constants_2.ALEX_ADDRESS,
            toAddress: constants_2.ALEX_ADDRESS_2,
        });
        chai_1.assert.isNotTrue(isTransferrable);
    }));
    (0, mocha_1.test)("ERC-721 v3 asset not owned by fromAddress is not transferrable", () => __awaiter(void 0, void 0, void 0, function* () {
        const isTransferrable = yield client.isAssetTransferrable({
            asset: {
                tokenId: "1",
                tokenAddress: constants_2.DIGITAL_ART_CHAIN_ADDRESS,
                schemaName: types_1.WyvernSchemaName.ERC721v3,
            },
            fromAddress: constants_2.ALEX_ADDRESS,
            toAddress: constants_2.ALEX_ADDRESS_2,
        });
        chai_1.assert.isNotTrue(isTransferrable);
    }));
    (0, mocha_1.test)("ERC-721 v3 asset owned by fromAddress is transferrable", () => __awaiter(void 0, void 0, void 0, function* () {
        const isTransferrable = yield client.isAssetTransferrable({
            asset: {
                tokenId: constants_2.DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
                tokenAddress: constants_2.DIGITAL_ART_CHAIN_ADDRESS,
                schemaName: types_1.WyvernSchemaName.ERC721v3,
            },
            fromAddress: constants_2.ALEX_ADDRESS,
            toAddress: constants_2.ALEX_ADDRESS_2,
        });
        chai_1.assert.isTrue(isTransferrable);
    }));
    (0, mocha_1.test)("ERC-721 v2 asset owned by fromAddress is transferrable", () => __awaiter(void 0, void 0, void 0, function* () {
        const isTransferrable = yield client.isAssetTransferrable({
            asset: {
                tokenId: constants_2.DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
                tokenAddress: constants_2.DIGITAL_ART_CHAIN_ADDRESS,
            },
            fromAddress: constants_2.ALEX_ADDRESS,
            toAddress: constants_2.ALEX_ADDRESS_2,
        });
        chai_1.assert.isTrue(isTransferrable);
    }));
    (0, mocha_1.test)("ERC-721 v1 asset owned by fromAddress is transferrable", () => __awaiter(void 0, void 0, void 0, function* () {
        const isTransferrable = yield client.isAssetTransferrable({
            asset: {
                tokenId: constants_2.CK_TOKEN_ID.toString(),
                tokenAddress: constants_2.CK_ADDRESS,
            },
            fromAddress: constants_2.ALEX_ADDRESS_2,
            toAddress: constants_2.ALEX_ADDRESS,
            useProxy: true,
        });
        chai_1.assert.isTrue(isTransferrable);
    }));
    (0, mocha_1.test)("ERC-20 asset not owned by fromAddress is not transferrable", () => __awaiter(void 0, void 0, void 0, function* () {
        const isTransferrable = yield client.isAssetTransferrable({
            asset: {
                tokenId: null,
                tokenAddress: constants_2.WETH_ADDRESS,
                schemaName: types_1.WyvernSchemaName.ERC20,
            },
            fromAddress: constants_2.RANDOM_ADDRESS,
            toAddress: constants_2.ALEX_ADDRESS_2,
        });
        chai_1.assert.isNotTrue(isTransferrable);
    }));
    (0, mocha_1.test)("ERC-20 asset owned by fromAddress is transferrable", () => __awaiter(void 0, void 0, void 0, function* () {
        const isTransferrable = yield client.isAssetTransferrable({
            asset: {
                tokenId: null,
                tokenAddress: constants_2.WETH_ADDRESS,
                schemaName: types_1.WyvernSchemaName.ERC20,
            },
            quantity: Math.pow(10, 18) * 0.001,
            fromAddress: constants_2.ALEX_ADDRESS,
            toAddress: constants_2.ALEX_ADDRESS_2,
        });
        chai_1.assert.isTrue(isTransferrable);
    }));
    (0, mocha_1.test)("ERC-1155 asset locked in contract is not transferrable", () => __awaiter(void 0, void 0, void 0, function* () {
        const isTransferrable2 = yield client.isAssetTransferrable({
            asset: {
                tokenId: constants_1.ENJIN_LEGACY_ADDRESS.toString(),
                tokenAddress: constants_2.CATS_IN_MECHS_ID,
                schemaName: types_1.WyvernSchemaName.ERC1155,
            },
            fromAddress: constants_2.ALEX_ADDRESS,
            toAddress: constants_2.ALEX_ADDRESS_2,
        });
        chai_1.assert.isNotTrue(isTransferrable2);
    }));
    (0, mocha_1.test)("ERC-1155 asset not owned by fromAddress is not transferrable", () => __awaiter(void 0, void 0, void 0, function* () {
        const isTransferrable = yield client.isAssetTransferrable({
            asset: {
                tokenId: constants_2.CATS_IN_MECHS_ID,
                tokenAddress: constants_1.ENJIN_ADDRESS,
                schemaName: types_1.WyvernSchemaName.ERC1155,
            },
            fromAddress: constants_2.DEVIN_ADDRESS,
            toAddress: constants_2.ALEX_ADDRESS_2,
        });
        chai_1.assert.isNotTrue(isTransferrable);
    }));
    (0, mocha_1.test)("Rinkeby ERC-1155 asset owned by fromAddress is transferrable", () => __awaiter(void 0, void 0, void 0, function* () {
        const isTransferrable = yield rinkebyClient.isAssetTransferrable({
            asset: {
                tokenAddress: constants_2.SANDBOX_RINKEBY_ADDRESS,
                tokenId: constants_2.SANDBOX_RINKEBY_ID,
                schemaName: types_1.WyvernSchemaName.ERC1155,
            },
            fromAddress: "0x61c461ecc993aadeb7e4b47e96d1b8cc37314b20",
            toAddress: constants_2.ALEX_ADDRESS,
        });
        chai_1.assert.isTrue(isTransferrable);
    }));
});
