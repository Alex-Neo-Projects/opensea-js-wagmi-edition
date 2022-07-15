"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeOrder = exports.serializeOrdersQueryOptions = exports.getOrdersAPIPath = void 0;
const types_1 = require("../types");
const utils_1 = require("../utils");
const NETWORK_TO_CHAIN = {
    [types_1.Network.Main]: "ethereum",
    [types_1.Network.Rinkeby]: "rinkeby",
};
const getOrdersAPIPath = (network, protocol, side) => {
    const chain = NETWORK_TO_CHAIN[network];
    const sidePath = side === "ask" ? "listings" : "offers";
    return `/api/v2/orders/${chain}/${protocol}/${sidePath}`;
};
exports.getOrdersAPIPath = getOrdersAPIPath;
const serializeOrdersQueryOptions = (options) => {
    return {
        limit: options.limit,
        cursor: options.cursor,
        payment_token_address: options.paymentTokenAddress,
        maker: options.maker,
        taker: options.taker,
        owner: options.owner,
        bundled: options.bundled,
        include_bundled: options.includeBundled,
        listed_after: options.listedAfter,
        listed_before: options.listedBefore,
        token_ids: options.tokenIds,
        asset_contract_address: options.assetContractAddress,
        order_by: options.orderBy,
        order_direction: options.orderDirection,
        only_english: options.onlyEnglish,
    };
};
exports.serializeOrdersQueryOptions = serializeOrdersQueryOptions;
const deserializeOrder = (order) => {
    return {
        createdDate: order.created_date,
        closingDate: order.closing_date,
        listingTime: order.listing_time,
        expirationTime: order.expiration_time,
        orderHash: order.order_hash,
        maker: (0, utils_1.accountFromJSON)(order.maker),
        taker: order.taker ? (0, utils_1.accountFromJSON)(order.taker) : null,
        protocolData: order.protocol_data,
        protocolAddress: order.protocol_address,
        currentPrice: order.current_price,
        makerFees: order.maker_fees.map(({ account, basis_points }) => ({
            account: (0, utils_1.accountFromJSON)(account),
            basisPoints: basis_points,
        })),
        takerFees: order.taker_fees.map(({ account, basis_points }) => ({
            account: (0, utils_1.accountFromJSON)(account),
            basisPoints: basis_points,
        })),
        side: order.side,
        orderType: order.order_type,
        cancelled: order.cancelled,
        finalized: order.finalized,
        markedInvalid: order.marked_invalid,
        clientSignature: order.client_signature,
        makerAssetBundle: (0, utils_1.assetBundleFromJSON)(order.maker_asset_bundle),
        takerAssetBundle: (0, utils_1.assetBundleFromJSON)(order.taker_asset_bundle),
    };
};
exports.deserializeOrder = deserializeOrder;
