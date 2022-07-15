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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenSeaAPI = void 0;
require("isomorphic-unfetch");
const QueryString = __importStar(require("query-string"));
const constants_1 = require("./constants");
const utils_1 = require("./orders/utils");
const types_1 = require("./types");
const utils_2 = require("./utils/utils");
class OpenSeaAPI {
    /**
     * Create an instance of the OpenSea API
     * @param config OpenSeaAPIConfig for setting up the API, including an optional API key, network name, and base URL
     * @param logger Optional function for logging debug strings before and after requests are made
     */
    constructor(config, logger) {
        var _a;
        /**
         * Page size to use for fetching orders
         */
        this.pageSize = 20;
        this.retryDelay = 3000;
        this.apiKey = config.apiKey;
        this.networkName = (_a = config.networkName) !== null && _a !== void 0 ? _a : types_1.Network.Main;
        switch (config.networkName) {
            case types_1.Network.Rinkeby:
                this.apiBaseUrl = config.apiBaseUrl || constants_1.API_BASE_RINKEBY;
                this.hostUrl = constants_1.SITE_HOST_RINKEBY;
                break;
            case types_1.Network.Main:
            default:
                this.apiBaseUrl = config.apiBaseUrl || constants_1.API_BASE_MAINNET;
                this.hostUrl = constants_1.SITE_HOST_MAINNET;
                break;
        }
        // Debugging: default to nothing
        this.logger = logger || ((arg) => arg);
    }
    /**
     * Gets an order from API based on query options. Throws when no order is found.
     */
    getOrder(_a) {
        var { protocol, side, orderDirection = "desc", orderBy = "created_date" } = _a, restOptions = __rest(_a, ["protocol", "side", "orderDirection", "orderBy"]);
        return __awaiter(this, void 0, void 0, function* () {
            const { orders } = yield this.get((0, utils_1.getOrdersAPIPath)(this.networkName, protocol, side), (0, utils_1.serializeOrdersQueryOptions)(Object.assign({ limit: 1, orderBy,
                orderDirection }, restOptions)));
            if (orders.length === 0) {
                throw new Error("Not found: no matching order found");
            }
            return (0, utils_1.deserializeOrder)(orders[0]);
        });
    }
    /**
     * Gets a list of orders from API based on query options and returns orders
     * with next and previous cursors.
     */
    getOrders(_a) {
        var { protocol, side, orderDirection = "desc", orderBy = "created_date" } = _a, restOptions = __rest(_a, ["protocol", "side", "orderDirection", "orderBy"]);
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.get((0, utils_1.getOrdersAPIPath)(this.networkName, protocol, side), (0, utils_1.serializeOrdersQueryOptions)(Object.assign({ limit: this.pageSize, orderBy,
                orderDirection }, restOptions)));
            return Object.assign(Object.assign({}, response), { orders: response.orders.map(utils_1.deserializeOrder) });
        });
    }
    /**
     * Send an order to be posted. Throws when the order is invalid.
     */
    postOrder(order, apiOptions, { retries = 2 } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let response;
            // TODO: Validate apiOptions. Avoid API calls that will definitely fail
            const { protocol, side } = apiOptions;
            try {
                response = yield this.post((0, utils_1.getOrdersAPIPath)(this.networkName, protocol, side), order);
            }
            catch (error) {
                _throwOrContinue(error, retries);
                yield (0, utils_2.delay)(this.retryDelay);
                return this.postOrder(order, apiOptions, { retries: retries - 1 });
            }
            return (0, utils_1.deserializeOrder)(response.order);
        });
    }
    /**
     * Send an order to the orderbook.
     * Throws when the order is invalid.
     * IN NEXT VERSION: change order input to Order type
     * @param order Order JSON to post to the orderbook
     * @param retries Number of times to retry if the service is unavailable for any reason
     */
    postOrderLegacyWyvern(order, retries = 2) {
        return __awaiter(this, void 0, void 0, function* () {
            let json;
            try {
                json = (yield this.post(`${constants_1.ORDERBOOK_PATH}/orders/post/`, order));
            }
            catch (error) {
                _throwOrContinue(error, retries);
                yield (0, utils_2.delay)(3000);
                return this.postOrderLegacyWyvern(order, retries - 1);
            }
            return (0, utils_2.orderFromJSON)(json);
        });
    }
    /**
     * Create a whitelist entry for an asset to prevent others from buying.
     * Buyers will have to have verified at least one of the emails
     * on an asset in order to buy.
     * This will throw a 403 if the given API key isn't allowed to create whitelist entries for this contract or asset.
     * @param tokenAddress Address of the asset's contract
     * @param tokenId The asset's token ID
     * @param email The email allowed to buy.
     */
    postAssetWhitelist(tokenAddress, tokenId, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = yield this.post(`${constants_1.API_PATH}/asset/${tokenAddress}/${tokenId}/whitelist/`, {
                email,
            });
            return !!json.success;
        });
    }
    /**
     * Get which version of Wyvern exchange to use to create orders
     * Simply return null in case API doesn't give us a good response
     */
    getOrderCreateWyvernExchangeAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.get(`${constants_1.ORDERBOOK_PATH}/exchange/`);
                return result;
            }
            catch (error) {
                this.logger("Couldn't retrieve Wyvern exchange address for order creation");
                return null;
            }
        });
    }
    /**
     * Get an order from the orderbook using the legacy wyvern API, throwing if none is found.
     * @param query Query to use for getting orders. A subset of parameters
     *  on the `OrderJSON` type is supported
     */
    getOrderLegacyWyvern(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.get(`${constants_1.ORDERBOOK_PATH}/orders/`, Object.assign({ limit: 1, side: types_1.OrderSide.Sell }, query));
            let orderJSON;
            if (constants_1.ORDERBOOK_VERSION == 0) {
                const json = result;
                orderJSON = json[0];
            }
            else {
                const json = result;
                orderJSON = json.orders[0];
            }
            if (!orderJSON) {
                throw new Error(`Not found: no matching order found`);
            }
            return (0, utils_2.orderFromJSON)(orderJSON);
        });
    }
    /**
     * Get a list of orders from the orderbook, returning the page of orders
     *  and the count of total orders found.
     * @param query Query to use for getting orders. A subset of parameters
     *  on the `OrderJSON` type is supported
     * @param page Page number, defaults to 1. Can be overridden by
     * `limit` and `offset` attributes from OrderQuery
     */
    getOrdersLegacyWyvern(query = {}, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.get(`${constants_1.ORDERBOOK_PATH}/orders/`, Object.assign({ limit: this.pageSize, offset: (page - 1) * this.pageSize, side: types_1.OrderSide.Sell }, query));
            if (constants_1.ORDERBOOK_VERSION == 0) {
                const json = result;
                return {
                    orders: json.map((j) => (0, utils_2.orderFromJSON)(j)),
                    count: json.length,
                };
            }
            else {
                const json = result;
                return {
                    orders: json.orders.map((j) => (0, utils_2.orderFromJSON)(j)),
                    count: json.count,
                };
            }
        });
    }
    /**
     * Fetch an asset from the API, throwing if none is found
     * @param tokenAddress Address of the asset's contract
     * @param tokenId The asset's token ID, or null if ERC-20
     * @param retries Number of times to retry if the service is unavailable for any reason
     */
    getAsset({ tokenAddress, tokenId, }, retries = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            let json;
            try {
                json = yield this.get(`${constants_1.API_PATH}/asset/${tokenAddress}/${tokenId || 0}/`);
            }
            catch (error) {
                _throwOrContinue(error, retries);
                yield (0, utils_2.delay)(1000);
                return this.getAsset({ tokenAddress, tokenId }, retries - 1);
            }
            return (0, utils_2.assetFromJSON)(json);
        });
    }
    /**
     * Fetch list of assets from the API, returning the page of assets and the count of total assets
     * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetJSON` type is supported
     */
    getAssets(query = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = yield this.get(`${constants_1.API_PATH}/assets/`, Object.assign({ limit: this.pageSize }, query));
            return {
                assets: json.assets.map((j) => (0, utils_2.assetFromJSON)(j)),
                next: json.next,
                previous: json.previous,
                estimatedCount: json.estimated_count,
            };
        });
    }
    /**
     * Fetch list of fungible tokens from the API matching parameters
     * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetJSON` type is supported
     * @param page Page number, defaults to 1. Can be overridden by
     * `limit` and `offset` attributes from OpenSeaFungibleTokenQuery
     * @param retries Number of times to retry if the service is unavailable for any reason
     */
    getPaymentTokens(query = {}, page = 1, retries = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            let json;
            try {
                json = yield this.get(`${constants_1.API_PATH}/tokens/`, Object.assign(Object.assign({}, query), { limit: this.pageSize, offset: (page - 1) * this.pageSize }));
            }
            catch (error) {
                _throwOrContinue(error, retries);
                yield (0, utils_2.delay)(1000);
                return this.getPaymentTokens(query, page, retries - 1);
            }
            return {
                tokens: json.map((t) => (0, utils_2.tokenFromJSON)(t)),
            };
        });
    }
    /**
     * Fetch a bundle from the API, return null if it isn't found
     * @param slug The bundle's identifier
     */
    getBundle({ slug, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = yield this.get(`${constants_1.API_PATH}/bundle/${slug}/`);
            return json ? (0, utils_2.assetBundleFromJSON)(json) : null;
        });
    }
    /**
     * Fetch list of bundles from the API, returning the page of bundles and the count of total bundles
     * @param query Query to use for getting orders. A subset of parameters on the `OpenSeaAssetBundleJSON` type is supported
     * @param page Page number, defaults to 1. Can be overridden by
     * `limit` and `offset` attributes from OpenSeaAssetBundleQuery
     */
    getBundles(query = {}, page = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const json = yield this.get(`${constants_1.API_PATH}/bundles/`, Object.assign(Object.assign({}, query), { limit: this.pageSize, offset: (page - 1) * this.pageSize }));
            return {
                bundles: json.bundles.map((j) => (0, utils_2.assetBundleFromJSON)(j)),
                estimatedCount: json.estimated_count,
            };
        });
    }
    /**
     * Get JSON data from API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param query Data to send. Will be stringified using QueryString
     */
    get(apiPath, query = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const qs = QueryString.stringify(query);
            const url = `${apiPath}?${qs}`;
            const response = yield this._fetch(url);
            return response.json();
        });
    }
    /**
     * POST JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send. Will be JSON.stringified
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    post(apiPath, body, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const fetchOpts = Object.assign({ method: "POST", body: body ? JSON.stringify(body) : undefined, headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                } }, opts);
            const response = yield this._fetch(apiPath, fetchOpts);
            return response.json();
        });
    }
    /**
     * PUT JSON data to API, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param body Data to send
     * @param opts RequestInit opts, similar to Fetch API. If it contains
     *  a body, it won't be stringified.
     */
    put(apiPath, body, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.post(apiPath, body, Object.assign({ method: "PUT" }, opts));
        });
    }
    /**
     * Get from an API Endpoint, sending auth token in headers
     * @param apiPath Path to URL endpoint under API
     * @param opts RequestInit opts, similar to Fetch API
     */
    _fetch(apiPath, opts = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiBase = this.apiBaseUrl;
            const apiKey = this.apiKey;
            const finalUrl = apiBase + apiPath;
            const finalOpts = Object.assign(Object.assign({}, opts), { headers: Object.assign(Object.assign({}, (apiKey ? { "X-API-KEY": apiKey } : {})), (opts.headers || {})) });
            this.logger(`Sending request: ${finalUrl} ${JSON.stringify(finalOpts).substr(0, 100)}...`);
            return fetch(finalUrl, finalOpts).then((res) => __awaiter(this, void 0, void 0, function* () { return this._handleApiResponse(res); }));
        });
    }
    _handleApiResponse(response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (response.ok) {
                this.logger(`Got success: ${response.status}`);
                return response;
            }
            let result;
            let errorMessage;
            try {
                result = yield response.text();
                result = JSON.parse(result);
            }
            catch (_a) {
                // Result will be undefined or text
            }
            this.logger(`Got error ${response.status}: ${JSON.stringify(result)}`);
            switch (response.status) {
                case 400:
                    errorMessage =
                        result && result.errors
                            ? result.errors.join(", ")
                            : `Invalid request: ${JSON.stringify(result)}`;
                    break;
                case 401:
                case 403:
                    errorMessage = `Unauthorized. Full message was '${JSON.stringify(result)}'`;
                    break;
                case 404:
                    errorMessage = `Not found. Full message was '${JSON.stringify(result)}'`;
                    break;
                case 500:
                    errorMessage = `Internal server error. OpenSea has been alerted, but if the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(result)}`;
                    break;
                case 503:
                    errorMessage = `Service unavailable. Please try again in a few minutes. If the problem persists please contact us via Discord: https://discord.gg/ga8EJbv - full message was ${JSON.stringify(result)}`;
                    break;
                default:
                    errorMessage = `Message: ${JSON.stringify(result)}`;
                    break;
            }
            throw new Error(`API Error ${response.status}: ${errorMessage}`);
        });
    }
}
exports.OpenSeaAPI = OpenSeaAPI;
function _throwOrContinue(error, retries) {
    const isUnavailable = error instanceof Error &&
        !!error.message &&
        (error.message.includes("503") || error.message.includes("429"));
    if (retries <= 0 || !isUnavailable) {
        throw error;
    }
}
