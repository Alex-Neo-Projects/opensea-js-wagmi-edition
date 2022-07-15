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
const utils_1 = require("../../utils");
const constants_2 = require("../constants");
const utils_2 = require("../utils");
const fees_1 = require("./fees");
const orders_1 = require("./orders");
const provider = new web3_1.default.providers.HttpProvider(constants_1.MAINNET_PROVIDER_URL);
const client = new index_1.OpenSeaSDK(provider, {
    networkName: types_1.Network.Main,
    apiKey: constants_2.MAINNET_API_KEY,
}, (line) => console.info(`MAINNET: ${line}`));
const assetsForBundleOrder = [
    {
        tokenId: constants_2.MYTHEREUM_TOKEN_ID.toString(),
        tokenAddress: constants_2.MYTHEREUM_ADDRESS,
        quantity: 1,
    },
    {
        tokenId: constants_2.DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
        tokenAddress: constants_2.DIGITAL_ART_CHAIN_ADDRESS,
        quantity: 1,
    },
];
const assetsForBundleOrderERC721v3 = [
    {
        tokenId: constants_2.MYTHEREUM_TOKEN_ID.toString(),
        tokenAddress: constants_2.MYTHEREUM_ADDRESS,
        quantity: 1,
        schemaName: types_1.WyvernSchemaName.ERC721v3,
    },
    {
        tokenId: constants_2.DIGITAL_ART_CHAIN_TOKEN_ID.toString(),
        tokenAddress: constants_2.DIGITAL_ART_CHAIN_ADDRESS,
        quantity: 1,
        schemaName: types_1.WyvernSchemaName.ERC721v3,
    },
];
const fungibleAssetsForBundleOrder = [
    {
        tokenAddress: constants_2.BENZENE_ADDRESS,
        tokenId: null,
        schemaName: types_1.WyvernSchemaName.ERC20,
        quantity: 20,
    },
    {
        tokenAddress: constants_2.GODS_UNCHAINED_CHEST_ADDRESS,
        tokenId: null,
        schemaName: types_1.WyvernSchemaName.ERC20,
        quantity: 1,
    },
];
const heterogenousSemiFungibleAssetsForBundleOrder = [
    {
        tokenId: constants_2.DISSOLUTION_TOKEN_ID,
        tokenAddress: constants_1.ENJIN_ADDRESS,
        schemaName: types_1.WyvernSchemaName.ERC1155,
        quantity: 2,
    },
    {
        tokenId: constants_2.AGE_OF_RUST_TOKEN_ID,
        tokenAddress: constants_1.ENJIN_ADDRESS,
        schemaName: types_1.WyvernSchemaName.ERC1155,
        quantity: 1,
    },
    {
        tokenId: constants_2.CRYPTOVOXELS_WEARABLE_ID,
        tokenAddress: constants_2.CRYPTOVOXELS_WEARABLE_ADDRESS,
        schemaName: types_1.WyvernSchemaName.ERC1155,
        quantity: 1,
    },
];
const homogenousSemiFungibleAssetsForBundleOrder = [
    {
        tokenId: constants_2.CRYPTOVOXELS_WEARABLE_ID,
        tokenAddress: constants_2.CRYPTOVOXELS_WEARABLE_ADDRESS,
        schemaName: types_1.WyvernSchemaName.ERC1155,
        quantity: 1,
    },
    {
        tokenId: constants_2.CRYPTOVOXELS_WEARABLE_2_ID,
        tokenAddress: constants_2.CRYPTOVOXELS_WEARABLE_ADDRESS,
        schemaName: types_1.WyvernSchemaName.ERC1155,
        quantity: 2,
    },
];
let manaAddress;
(0, mocha_1.suite)("SDK: bundles", () => {
    (0, mocha_1.before)(() => __awaiter(void 0, void 0, void 0, function* () {
        manaAddress = (yield client.api.getPaymentTokens({ symbol: "MANA" }))
            .tokens[0].address;
    }));
    (0, mocha_1.test)("Matches heterogenous bundle buy order", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const takerAddress = constants_2.ALEX_ADDRESS;
        const amountInEth = 0.01;
        const order = yield client._makeBundleBuyOrder({
            assets: assetsForBundleOrder,
            quantities: [1, 1],
            accountAddress,
            startAmount: amountInEth,
            extraBountyBasisPoints: 0,
            paymentTokenAddress: constants_2.WETH_ADDRESS,
        });
        chai_1.assert.equal(order.paymentToken, constants_2.WETH_ADDRESS);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
        chai_1.assert.equal(order.extra.toNumber(), 0);
        chai_1.assert.notEqual(order.expirationTime.toNumber(), 0);
        chai_1.assert.isTrue((0, utils_2.areTimestampsNearlyEqual)((0, utils_1.getMaxOrderExpirationTimestamp)(), order.expirationTime.toNumber()));
        testBundleMetadata(order, types_1.WyvernSchemaName.ERC721);
        (0, fees_1.testFeesMakerOrder)(order, undefined);
        yield client._buyOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.test)("Matches homogenous bundle buy order", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const takerAddress = constants_2.ALEX_ADDRESS;
        const amountInToken = 10;
        const assets = [
            {
                tokenId: constants_2.MYTHEREUM_TOKEN_ID.toString(),
                tokenAddress: constants_2.MYTHEREUM_ADDRESS,
            },
        ];
        const order = yield client._makeBundleBuyOrder({
            assets,
            collection: { slug: constants_2.MYTHEREUM_SLUG },
            quantities: [1],
            accountAddress,
            startAmount: amountInToken,
            extraBountyBasisPoints: 0,
            paymentTokenAddress: manaAddress,
        });
        const asset = yield client.api.getAsset(assets[0]);
        chai_1.assert.equal(order.paymentToken, manaAddress);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInToken);
        chai_1.assert.equal(order.extra.toNumber(), 0);
        chai_1.assert.notEqual(order.expirationTime.toNumber(), 0);
        chai_1.assert.isTrue((0, utils_2.areTimestampsNearlyEqual)((0, utils_1.getMaxOrderExpirationTimestamp)(), order.expirationTime.toNumber()));
        testBundleMetadata(order, types_1.WyvernSchemaName.ERC721);
        (0, fees_1.testFeesMakerOrder)(order, asset.collection);
        yield client._buyOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.test)("Matches fixed heterogenous bountied bundle sell order", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const takerAddress = constants_2.ALEX_ADDRESS;
        const amountInEth = 1;
        const bountyPercent = 1.5;
        const order = yield client._makeBundleSellOrder({
            bundleName: "Test Bundle",
            bundleDescription: "This is a test with different types of assets",
            assets: assetsForBundleOrder,
            quantities: [1, 1],
            accountAddress,
            startAmount: amountInEth,
            extraBountyBasisPoints: bountyPercent * 100,
            paymentTokenAddress: constants_1.NULL_ADDRESS,
            waitForHighestBid: false,
            buyerAddress: constants_1.NULL_ADDRESS,
        });
        chai_1.assert.equal(order.paymentToken, constants_1.NULL_ADDRESS);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
        chai_1.assert.equal(order.extra.toNumber(), 0);
        chai_1.assert.notEqual(order.expirationTime.toNumber(), 0);
        chai_1.assert.isTrue((0, utils_2.areTimestampsNearlyEqual)((0, utils_1.getMaxOrderExpirationTimestamp)(), order.expirationTime.toNumber()));
        testBundleMetadata(order, types_1.WyvernSchemaName.ERC721);
        (0, fees_1.testFeesMakerOrder)(order, undefined, bountyPercent * 100);
        yield client._sellOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.test)("Matches fixed heterogenous bountied bundle sell order ERC721v3", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const takerAddress = constants_2.ALEX_ADDRESS;
        const amountInEth = 1;
        const bountyPercent = 1.5;
        const order = yield client._makeBundleSellOrder({
            bundleName: "Test Bundle",
            bundleDescription: "This is a test with different types of assets",
            assets: assetsForBundleOrderERC721v3,
            quantities: [1, 1],
            accountAddress,
            startAmount: amountInEth,
            extraBountyBasisPoints: bountyPercent * 100,
            paymentTokenAddress: constants_1.NULL_ADDRESS,
            waitForHighestBid: false,
            buyerAddress: constants_1.NULL_ADDRESS,
        });
        chai_1.assert.equal(order.paymentToken, constants_1.NULL_ADDRESS);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
        chai_1.assert.equal(order.extra.toNumber(), 0);
        chai_1.assert.notEqual(order.expirationTime.toNumber(), 0);
        chai_1.assert.isTrue((0, utils_2.areTimestampsNearlyEqual)((0, utils_1.getMaxOrderExpirationTimestamp)(), order.expirationTime.toNumber()));
        testBundleMetadata(order, types_1.WyvernSchemaName.ERC721v3);
        (0, fees_1.testFeesMakerOrder)(order, undefined, bountyPercent * 100);
        yield client._sellOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.test)("Matches homogenous, bountied bundle sell order", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const takerAddress = constants_2.ALEX_ADDRESS;
        const amountInEth = 1;
        const bountyPercent = 0.8;
        const assets = [
            {
                tokenId: constants_2.MYTHEREUM_TOKEN_ID.toString(),
                tokenAddress: constants_2.MYTHEREUM_ADDRESS,
            },
        ];
        const order = yield client._makeBundleSellOrder({
            bundleName: "Test Homogenous Bundle",
            bundleDescription: "This is a test with one type of asset",
            assets,
            collection: { slug: constants_2.MYTHEREUM_SLUG },
            quantities: [1],
            accountAddress,
            startAmount: amountInEth,
            extraBountyBasisPoints: bountyPercent * 100,
            paymentTokenAddress: constants_1.NULL_ADDRESS,
            waitForHighestBid: false,
            buyerAddress: constants_1.NULL_ADDRESS,
        });
        const asset = yield client.api.getAsset(assets[0]);
        chai_1.assert.equal(order.paymentToken, constants_1.NULL_ADDRESS);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
        chai_1.assert.equal(order.extra.toNumber(), 0);
        chai_1.assert.notEqual(order.expirationTime.toNumber(), 0);
        chai_1.assert.isTrue((0, utils_2.areTimestampsNearlyEqual)((0, utils_1.getMaxOrderExpirationTimestamp)(), order.expirationTime.toNumber()));
        testBundleMetadata(order, types_1.WyvernSchemaName.ERC721);
        (0, fees_1.testFeesMakerOrder)(order, asset.collection, bountyPercent * 100);
        yield client._sellOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.test)("Matches a new bundle sell order for an ERC-20 token (MANA)", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const takerAddress = constants_2.ALEX_ADDRESS;
        const token = (yield client.api.getPaymentTokens({ symbol: "MANA" }))
            .tokens[0];
        const amountInToken = 2.422;
        const order = yield client._makeBundleSellOrder({
            bundleName: "Test Bundle",
            bundleDescription: "This is a test with different types of assets",
            assets: assetsForBundleOrder,
            quantities: [1, 1],
            accountAddress,
            startAmount: amountInToken,
            paymentTokenAddress: token.address,
            extraBountyBasisPoints: 0,
            waitForHighestBid: false,
            buyerAddress: constants_1.NULL_ADDRESS,
        });
        chai_1.assert.equal(order.paymentToken, token.address);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, token.decimals) * amountInToken);
        chai_1.assert.equal(order.extra.toNumber(), 0);
        testBundleMetadata(order, types_1.WyvernSchemaName.ERC721);
        chai_1.assert.notEqual(order.expirationTime.toNumber(), 0);
        chai_1.assert.isTrue((0, utils_2.areTimestampsNearlyEqual)((0, utils_1.getMaxOrderExpirationTimestamp)(), order.expirationTime.toNumber()));
        yield client._sellOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.test)("Matches Dutch bundle order for different approve-all assets", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const takerAddress = constants_2.ALEX_ADDRESS;
        const expirationTime = Math.round(Date.now() / 1000 + 60 * 60 * 24); // one day from now
        const amountInEth = 1;
        const order = yield client._makeBundleSellOrder({
            bundleName: "Test Bundle",
            bundleDescription: "This is a test with different types of assets",
            assets: assetsForBundleOrder,
            quantities: [1, 1],
            accountAddress,
            startAmount: amountInEth,
            endAmount: 0,
            expirationTime,
            extraBountyBasisPoints: 0,
            waitForHighestBid: false,
            buyerAddress: constants_1.NULL_ADDRESS,
            paymentTokenAddress: constants_1.NULL_ADDRESS,
        });
        chai_1.assert.equal(order.paymentToken, constants_1.NULL_ADDRESS);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
        chai_1.assert.equal(order.extra.toNumber(), Math.pow(10, 18) * amountInEth);
        chai_1.assert.equal(order.expirationTime.toNumber(), expirationTime);
        testBundleMetadata(order, types_1.WyvernSchemaName.ERC721);
        yield client._sellOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.test)("Can bundle multiple fungible tokens together", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const takerAddress = constants_2.ALEX_ADDRESS;
        const amountInEth = 1;
        const order = yield client._makeBundleSellOrder({
            bundleName: "Test Bundle",
            bundleDescription: "This is a test with fungible assets",
            assets: fungibleAssetsForBundleOrder,
            quantities: fungibleAssetsForBundleOrder.map((a) => a.quantity),
            accountAddress,
            startAmount: amountInEth,
            extraBountyBasisPoints: 0,
            waitForHighestBid: false,
            buyerAddress: constants_1.NULL_ADDRESS,
            paymentTokenAddress: constants_1.NULL_ADDRESS,
        });
        chai_1.assert.equal(order.paymentToken, constants_1.NULL_ADDRESS);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
        testBundleMetadata(order, types_1.WyvernSchemaName.ERC20);
        (0, fees_1.testFeesMakerOrder)(order, undefined);
        yield client._sellOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.test)("Can bundle multiple SFTs together", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const takerAddress = constants_2.ALEX_ADDRESS;
        const amountInEth = 1;
        const order = yield client._makeBundleSellOrder({
            bundleName: "Test Bundle",
            bundleDescription: "This is a test with SFT assets",
            assets: heterogenousSemiFungibleAssetsForBundleOrder,
            quantities: heterogenousSemiFungibleAssetsForBundleOrder.map((a) => a.quantity),
            accountAddress,
            startAmount: amountInEth,
            extraBountyBasisPoints: 0,
            waitForHighestBid: false,
            buyerAddress: constants_1.NULL_ADDRESS,
            paymentTokenAddress: constants_1.NULL_ADDRESS,
        });
        chai_1.assert.equal(order.paymentToken, constants_1.NULL_ADDRESS);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
        testBundleMetadata(order, types_1.WyvernSchemaName.ERC1155);
        (0, fees_1.testFeesMakerOrder)(order, undefined);
        yield client._sellOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.test)("Can bundle multiple homogenous semifungibles", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const takerAddress = constants_2.ALEX_ADDRESS;
        const amountInEth = 1;
        const asset = yield client.api.getAsset(homogenousSemiFungibleAssetsForBundleOrder[0]);
        const order = yield client._makeBundleSellOrder({
            bundleName: "Test Bundle",
            bundleDescription: "This is a test with homogenous SFT assets",
            assets: homogenousSemiFungibleAssetsForBundleOrder,
            collection: asset.collection,
            quantities: homogenousSemiFungibleAssetsForBundleOrder.map((a) => a.quantity),
            accountAddress,
            startAmount: amountInEth,
            extraBountyBasisPoints: 0,
            waitForHighestBid: false,
            buyerAddress: constants_1.NULL_ADDRESS,
            paymentTokenAddress: constants_1.NULL_ADDRESS,
        });
        chai_1.assert.equal(order.paymentToken, constants_1.NULL_ADDRESS);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
        testBundleMetadata(order, types_1.WyvernSchemaName.ERC1155);
        (0, fees_1.testFeesMakerOrder)(order, asset.collection);
        yield client._sellOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.test)("Matches bundle sell order for misordered assets with different schemas", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const takerAddress = constants_2.ALEX_ADDRESS_2;
        const amountInEth = 1;
        const assets = [
            assetsForBundleOrder[0],
            fungibleAssetsForBundleOrder[0],
            heterogenousSemiFungibleAssetsForBundleOrder[0],
        ];
        const order = yield client._makeBundleSellOrder({
            bundleName: "Test Bundle",
            bundleDescription: "This is a test with different schemas of assets",
            assets,
            quantities: assets.map((a) => a.quantity),
            accountAddress,
            startAmount: amountInEth,
            extraBountyBasisPoints: 0,
            waitForHighestBid: false,
            buyerAddress: constants_1.NULL_ADDRESS,
            paymentTokenAddress: constants_1.NULL_ADDRESS,
        });
        chai_1.assert.equal(order.paymentToken, constants_1.NULL_ADDRESS);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
        (0, fees_1.testFeesMakerOrder)(order, undefined);
        yield client._sellOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.test)("Matches bundle buy order for misordered assets with different schemas", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS_2;
        const takerAddress = constants_2.ALEX_ADDRESS;
        const amountInEth = 0.01;
        const assets = [
            assetsForBundleOrder[0],
            fungibleAssetsForBundleOrder[0],
            heterogenousSemiFungibleAssetsForBundleOrder[0],
        ];
        const order = yield client._makeBundleBuyOrder({
            assets,
            quantities: assets.map((a) => a.quantity),
            accountAddress,
            startAmount: amountInEth,
            extraBountyBasisPoints: 0,
            paymentTokenAddress: constants_2.WETH_ADDRESS,
        });
        chai_1.assert.equal(order.paymentToken, constants_2.WETH_ADDRESS);
        chai_1.assert.equal(order.basePrice.toNumber(), Math.pow(10, 18) * amountInEth);
        chai_1.assert.equal(order.extra.toNumber(), 0);
        chai_1.assert.notEqual(order.expirationTime.toNumber(), 0);
        chai_1.assert.isTrue((0, utils_2.areTimestampsNearlyEqual)((0, utils_1.getMaxOrderExpirationTimestamp)(), order.expirationTime.toNumber()));
        (0, fees_1.testFeesMakerOrder)(order, undefined);
        yield client._buyOrderValidationAndApprovals({ order, accountAddress });
        // Make sure match is valid
        yield (0, orders_1.testMatchingNewOrder)(order, takerAddress);
    }));
    (0, mocha_1.suite)("Expiration times", () => {
        (0, mocha_1.test)("it fails when expiration time is 0", () => __awaiter(void 0, void 0, void 0, function* () {
            const accountAddress = constants_2.ALEX_ADDRESS;
            const amountInEth = 1;
            const bountyPercent = 1.5;
            try {
                yield client._makeBundleSellOrder({
                    bundleName: "Test Bundle",
                    bundleDescription: "This is a test with different types of assets",
                    assets: assetsForBundleOrder,
                    quantities: [1, 1],
                    accountAddress,
                    startAmount: amountInEth,
                    extraBountyBasisPoints: bountyPercent * 100,
                    paymentTokenAddress: constants_1.NULL_ADDRESS,
                    waitForHighestBid: false,
                    buyerAddress: constants_1.NULL_ADDRESS,
                    expirationTime: 0,
                });
                chai_1.assert.fail();
            }
            catch (error) {
                chai_1.assert.include(error.message, "Expiration time cannot be 0");
            }
            try {
                yield client._makeBundleBuyOrder({
                    assets: assetsForBundleOrder,
                    quantities: [1, 1],
                    accountAddress,
                    startAmount: amountInEth,
                    extraBountyBasisPoints: 0,
                    paymentTokenAddress: constants_2.WETH_ADDRESS,
                    expirationTime: 0,
                });
                chai_1.assert.fail();
            }
            catch (error) {
                chai_1.assert.include(error.message, "Expiration time cannot be 0");
            }
        }));
        (0, mocha_1.test)("it fails when expiration time exceeds six months", () => __awaiter(void 0, void 0, void 0, function* () {
            const accountAddress = constants_2.ALEX_ADDRESS;
            const amountInEth = 1;
            const bountyPercent = 1.5;
            const expirationDate = new Date();
            expirationDate.setMonth(expirationDate.getMonth() + 7);
            const expirationTime = Math.round(expirationDate.getTime() / 1000);
            try {
                yield client._makeBundleSellOrder({
                    bundleName: "Test Bundle",
                    bundleDescription: "This is a test with different types of assets",
                    assets: assetsForBundleOrder,
                    quantities: [1, 1],
                    accountAddress,
                    startAmount: amountInEth,
                    extraBountyBasisPoints: bountyPercent * 100,
                    paymentTokenAddress: constants_1.NULL_ADDRESS,
                    waitForHighestBid: false,
                    buyerAddress: constants_1.NULL_ADDRESS,
                    expirationTime,
                });
                chai_1.assert.fail();
            }
            catch (error) {
                chai_1.assert.include(error.message, "Expiration time must not exceed six months from now");
            }
            try {
                yield client._makeBundleBuyOrder({
                    assets: assetsForBundleOrder,
                    quantities: [1, 1],
                    accountAddress,
                    startAmount: amountInEth,
                    extraBountyBasisPoints: 0,
                    paymentTokenAddress: constants_2.WETH_ADDRESS,
                    expirationTime,
                });
                chai_1.assert.fail();
            }
            catch (error) {
                chai_1.assert.include(error.message, "Expiration time must not exceed six months from now");
            }
        }));
        (0, mocha_1.test)("it handles expiration time duration correctly", () => __awaiter(void 0, void 0, void 0, function* () {
            const accountAddress = constants_2.ALEX_ADDRESS;
            const paymentTokenAddress = manaAddress;
            const tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
            const tokenAddress = constants_2.MYTHEREUM_ADDRESS;
            // Added buffer
            const listingTime = Math.floor(new Date().getTime() / 1000) + 60;
            // 10 minutes after
            const expirationTime = listingTime + 600;
            try {
                yield client._makeSellOrder({
                    asset: { tokenAddress, tokenId },
                    quantity: 1,
                    accountAddress,
                    startAmount: 2,
                    extraBountyBasisPoints: 0,
                    buyerAddress: constants_1.NULL_ADDRESS,
                    paymentTokenAddress,
                    waitForHighestBid: false,
                    listingTime,
                    expirationTime,
                });
                chai_1.assert.fail();
            }
            catch (error) {
                chai_1.assert.include(error.message, `Expiration time must be at least 15 minutes from the listing date`);
            }
            try {
                yield client._makeBuyOrder({
                    asset: { tokenAddress, tokenId },
                    quantity: 1,
                    accountAddress,
                    startAmount: 2,
                    extraBountyBasisPoints: 0,
                    paymentTokenAddress,
                    expirationTime,
                });
                chai_1.assert.fail();
            }
            catch (error) {
                chai_1.assert.include(error.message, `Expiration time must be at least 15 minutes from the listing date`);
            }
            const twentyMinuteExpirationTime = expirationTime + 600;
            const sellOrder = yield client._makeSellOrder({
                asset: { tokenAddress, tokenId },
                quantity: 1,
                accountAddress,
                startAmount: 2,
                extraBountyBasisPoints: 0,
                buyerAddress: constants_1.NULL_ADDRESS,
                paymentTokenAddress,
                waitForHighestBid: false,
                listingTime,
                // 20 minutes after listing time
                expirationTime: twentyMinuteExpirationTime,
            });
            chai_1.assert.equal(sellOrder["expirationTime"].toNumber(), twentyMinuteExpirationTime);
            const buyOrder = yield client._makeBuyOrder({
                asset: { tokenAddress, tokenId },
                quantity: 1,
                accountAddress,
                startAmount: 2,
                extraBountyBasisPoints: 0,
                paymentTokenAddress,
                expirationTime: twentyMinuteExpirationTime,
            });
            chai_1.assert.equal(buyOrder["expirationTime"].toNumber(), twentyMinuteExpirationTime);
        }));
    });
});
function testBundleMetadata(order, schemaName) {
    chai_1.assert.containsAllKeys(order.metadata, ["bundle"]);
    if (!("bundle" in order.metadata)) {
        return;
    }
    chai_1.assert.isNotEmpty(order.metadata.bundle.assets);
    const expectedSchemas = order.metadata.bundle.assets.map(() => schemaName);
    chai_1.assert.deepEqual(order.metadata.bundle.schemas, expectedSchemas);
}
