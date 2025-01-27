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
const wyvern_js_1 = require("wyvern-js");
const constants_1 = require("../../constants");
const index_1 = require("../../index");
const types_1 = require("../../types");
const utils_1 = require("../../utils/utils");
const constants_2 = require("../constants");
const provider = new web3_1.default.providers.HttpProvider(constants_1.MAINNET_PROVIDER_URL);
const client = new index_1.OpenSeaSDK(provider, {
    networkName: types_1.Network.Main,
    apiKey: constants_2.MAINNET_API_KEY,
}, (line) => console.info(`MAINNET: ${line}`));
(0, mocha_1.suite)("api", () => {
    (0, mocha_1.test)("API has correct base url", () => {
        chai_1.assert.equal(constants_2.mainApi.apiBaseUrl, "https://api.opensea.io");
        chai_1.assert.equal(constants_2.rinkebyApi.apiBaseUrl, "https://testnets-api.opensea.io");
    });
    (0, mocha_1.test)("API fetches bundles and prefetches sell orders", () => __awaiter(void 0, void 0, void 0, function* () {
        const { bundles } = yield constants_2.apiToTest.getBundles({
            asset_contract_address: constants_2.CK_RINKEBY_ADDRESS,
        });
        chai_1.assert.isArray(bundles);
        const bundle = bundles[0];
        chai_1.assert.isNotNull(bundle);
        if (!bundle) {
            return;
        }
        chai_1.assert.include(bundle.assets.map((a) => a.assetContract.name), "CryptoKittiesRinkeby");
    }));
    (0, mocha_1.test)("Includes API key in token request", () => __awaiter(void 0, void 0, void 0, function* () {
        const oldLogger = constants_2.rinkebyApi.logger;
        const logPromise = new Promise((resolve, reject) => {
            constants_2.rinkebyApi.logger = (log) => {
                try {
                    chai_1.assert.include(log, `"X-API-KEY":"${constants_2.RINKEBY_API_KEY}"`);
                    resolve();
                }
                catch (e) {
                    reject(e);
                }
                finally {
                    constants_2.rinkebyApi.logger = oldLogger;
                }
            };
            constants_2.rinkebyApi.getPaymentTokens({ symbol: "WETH" });
        });
        yield logPromise;
    }));
    (0, mocha_1.test)("orderToJSON is correct", () => __awaiter(void 0, void 0, void 0, function* () {
        const accountAddress = constants_2.ALEX_ADDRESS;
        const quantity = 1;
        const amountInToken = 1.2;
        const paymentTokenAddress = constants_2.WETH_ADDRESS;
        const extraBountyBasisPoints = 0;
        const expirationTime = Math.round(Date.now() / 1000 + (constants_1.MIN_EXPIRATION_MINUTES + 1) * 60); // sixteen minutes from now
        const englishAuctionReservePrice = 2;
        const tokenId = constants_2.MYTHEREUM_TOKEN_ID.toString();
        const tokenAddress = constants_2.MYTHEREUM_ADDRESS;
        const order = yield client._makeSellOrder({
            asset: { tokenAddress, tokenId },
            quantity,
            accountAddress,
            startAmount: amountInToken,
            paymentTokenAddress,
            extraBountyBasisPoints,
            buyerAddress: constants_1.NULL_ADDRESS,
            expirationTime,
            waitForHighestBid: true,
            englishAuctionReservePrice,
        });
        const hashedOrder = Object.assign(Object.assign({}, order), { hash: (0, utils_1.getOrderHash)(order) });
        const orderData = (0, index_1.orderToJSON)(hashedOrder);
        chai_1.assert.equal(orderData.quantity, quantity.toString());
        chai_1.assert.equal(orderData.maker, accountAddress);
        chai_1.assert.equal(orderData.taker, constants_1.NULL_ADDRESS);
        chai_1.assert.equal(orderData.basePrice, wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(amountInToken), 18).toString());
        chai_1.assert.equal(orderData.paymentToken, paymentTokenAddress);
        chai_1.assert.equal(orderData.extra, extraBountyBasisPoints.toString());
        chai_1.assert.equal(orderData.expirationTime, expirationTime + constants_1.ORDER_MATCHING_LATENCY_SECONDS);
        chai_1.assert.equal(orderData.englishAuctionReservePrice, wyvern_js_1.WyvernProtocol.toBaseUnitAmount((0, utils_1.makeBigNumber)(englishAuctionReservePrice), 18).toString());
    }));
    (0, mocha_1.test)("API fetches tokens", () => __awaiter(void 0, void 0, void 0, function* () {
        const { tokens } = yield constants_2.apiToTest.getPaymentTokens({ symbol: "MANA" });
        chai_1.assert.isArray(tokens);
        chai_1.assert.equal(tokens.length, 1);
        chai_1.assert.equal(tokens[0].name, "Decentraland MANA");
    }));
    (0, mocha_1.test)("Rinkeby API orders have correct OpenSea url", () => __awaiter(void 0, void 0, void 0, function* () {
        const order = yield constants_2.rinkebyApi.getOrderLegacyWyvern({});
        if (!order.asset) {
            return;
        }
        const url = `https://testnets.opensea.io/assets/rinkeby/${order.asset.assetContract.address}/${order.asset.tokenId}`;
        chai_1.assert.equal(order.asset.openseaLink, url);
    }));
    (0, mocha_1.test)("Mainnet API orders have correct OpenSea url", () => __awaiter(void 0, void 0, void 0, function* () {
        const order = yield constants_2.mainApi.getOrderLegacyWyvern({});
        if (!order.asset) {
            return;
        }
        const url = `https://opensea.io/assets/ethereum/${order.asset.assetContract.address}/${order.asset.tokenId}`;
        chai_1.assert.equal(order.asset.openseaLink, url);
    }));
    (0, mocha_1.test)("API fetches orderbook", () => __awaiter(void 0, void 0, void 0, function* () {
        const { orders, count } = yield constants_2.apiToTest.getOrdersLegacyWyvern();
        chai_1.assert.isArray(orders);
        chai_1.assert.isNumber(count);
        chai_1.assert.equal(orders.length, constants_2.apiToTest.pageSize);
        // assert.isAtLeast(count, orders.length)
    }));
    (0, mocha_1.test)("API can change page size", () => __awaiter(void 0, void 0, void 0, function* () {
        const defaultPageSize = constants_2.apiToTest.pageSize;
        constants_2.apiToTest.pageSize = 7;
        const { orders } = yield constants_2.apiToTest.getOrdersLegacyWyvern();
        chai_1.assert.equal(orders.length, 7);
        constants_2.apiToTest.pageSize = defaultPageSize;
    }));
    if (constants_1.ORDERBOOK_VERSION > 0) {
        (0, mocha_1.test)("API orderbook paginates", () => __awaiter(void 0, void 0, void 0, function* () {
            const { orders, count } = yield constants_2.apiToTest.getOrdersLegacyWyvern();
            const pagination = yield constants_2.apiToTest.getOrdersLegacyWyvern({}, 2);
            chai_1.assert.equal(pagination.orders.length, constants_2.apiToTest.pageSize);
            chai_1.assert.notDeepEqual(pagination.orders[0], orders[0]);
            chai_1.assert.equal(pagination.count, count);
        }));
    }
    (0, mocha_1.test)("API fetches orders for asset", () => __awaiter(void 0, void 0, void 0, function* () {
        const forKitty = yield constants_2.apiToTest.getOrdersLegacyWyvern({
            asset_contract_address: constants_2.CK_RINKEBY_ADDRESS,
            token_id: constants_2.CK_RINKEBY_TOKEN_ID,
            side: types_1.OrderSide.Buy,
        });
        chai_1.assert.isArray(forKitty.orders);
    }));
    // Temp skip due to migration
    mocha_1.test.skip("API fetches orders for asset owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const forOwner = yield constants_2.apiToTest.getOrdersLegacyWyvern({
            owner: constants_2.ALEX_ADDRESS,
        });
        chai_1.assert.isAbove(forOwner.orders.length, 0);
        chai_1.assert.isAbove(forOwner.count, 0);
        const owners = forOwner.orders.map((o) => o.asset && o.asset.owner && o.asset.owner.address);
        owners.forEach((owner) => {
            chai_1.assert.include([constants_2.ALEX_ADDRESS, constants_1.NULL_ADDRESS], owner);
        });
    }));
    // Temp skip due to migration
    mocha_1.test.skip("API fetches buy orders for maker", () => __awaiter(void 0, void 0, void 0, function* () {
        const forMaker = yield constants_2.apiToTest.getOrdersLegacyWyvern({
            maker: constants_2.ALEX_ADDRESS_2,
            side: types_1.OrderSide.Buy,
        });
        chai_1.assert.isAbove(forMaker.orders.length, 0);
        chai_1.assert.isAbove(forMaker.count, 0);
        forMaker.orders.forEach((order) => {
            chai_1.assert.equal(constants_2.ALEX_ADDRESS_2, order.maker);
            chai_1.assert.equal(types_1.OrderSide.Buy, order.side);
        });
    }));
    (0, mocha_1.test)("API excludes cancelledOrFinalized and markedInvalid orders", () => __awaiter(void 0, void 0, void 0, function* () {
        const { orders } = yield constants_2.apiToTest.getOrdersLegacyWyvern({ limit: 50 });
        const finishedOrders = orders.filter((o) => o.cancelledOrFinalized);
        chai_1.assert.isEmpty(finishedOrders);
        const invalidOrders = orders.filter((o) => o.markedInvalid);
        chai_1.assert.isEmpty(invalidOrders);
    }));
    (0, mocha_1.test)("API fetches fees for an asset", () => __awaiter(void 0, void 0, void 0, function* () {
        const asset = yield constants_2.apiToTest.getAsset({
            tokenAddress: constants_2.CK_RINKEBY_ADDRESS,
            tokenId: constants_2.CK_RINKEBY_TOKEN_ID,
        });
        chai_1.assert.equal(asset.tokenId, constants_2.CK_RINKEBY_TOKEN_ID.toString());
        chai_1.assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby");
        chai_1.assert.equal(asset.assetContract.sellerFeeBasisPoints, constants_2.CK_RINKEBY_SELLER_FEE);
    }));
    (0, mocha_1.test)("API fetches assets", () => __awaiter(void 0, void 0, void 0, function* () {
        const { assets } = yield constants_2.apiToTest.getAssets({
            asset_contract_address: constants_2.CK_RINKEBY_ADDRESS,
            order_by: "sale_date",
        });
        chai_1.assert.isArray(assets);
        chai_1.assert.equal(assets.length, constants_2.apiToTest.pageSize);
        const asset = assets[0];
        chai_1.assert.equal(asset.assetContract.name, "CryptoKittiesRinkeby");
    }));
    (0, mocha_1.test)("API handles errors", () => __awaiter(void 0, void 0, void 0, function* () {
        // 401 Unauthorized
        try {
            yield constants_2.apiToTest.get("/user");
        }
        catch (error) {
            chai_1.assert.include(error.message, "Unauthorized");
        }
        // 404 Not found
        try {
            yield constants_2.apiToTest.get(`/asset/${constants_2.CK_RINKEBY_ADDRESS}/0`);
        }
        catch (error) {
            chai_1.assert.include(error.message, "Not found");
        }
        // 400 malformed
        const res = yield constants_2.apiToTest.getOrdersLegacyWyvern({
            // Get an old order to make sure listing time is too early
            listed_before: Math.round(Date.now() / 1000 - 3600),
            side: types_1.OrderSide.Sell,
        });
        const order = res.orders[0];
        chai_1.assert.isNotNull(order);
        try {
            const newOrder = Object.assign(Object.assign({}, (0, index_1.orderToJSON)(order)), { v: 1, r: "", s: "" });
            yield constants_2.apiToTest.postOrderLegacyWyvern(newOrder);
        }
        catch (error) {
            // TODO sometimes the error is "Expected the listing time to be at or past the current time"
            // assert.include(error.message, "Order failed exchange validation")
        }
    }));
});
