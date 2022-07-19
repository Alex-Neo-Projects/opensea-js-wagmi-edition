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
exports.__esModule = true;
exports.UniswapExchange = exports.UniswapFactory = exports.WrappedNFTLiquidationProxy = exports.WrappedNFTFactory = exports.WrappedNFT = exports.CanonicalWETH = exports.DecentralandEstates = exports.CheezeWizardsBasicTournament = exports.StaticCheckDecentralandEstates = exports.StaticCheckCheezeWizards = exports.StaticCheckTxOrigin = exports.ERC1155 = exports.ERC721 = exports.ERC20 = exports.getMethod = void 0;
var getMethod = function (abi, name) {
    var methodAbi = abi.find(function (x) { return x.type == "function" && x.name == name; });
    if (!methodAbi) {
        throw new Error("ABI ".concat(name, " not found"));
    }
    // Have to cast since there's a bug in
    // web3 types on the 'type' field
    return methodAbi;
};
exports.getMethod = getMethod;
var ERC20_1 = require("./abi/ERC20");
__createBinding(exports, ERC20_1, "ERC20");
var ERC721v3_1 = require("./abi/ERC721v3");
__createBinding(exports, ERC721v3_1, "ERC721");
var ERC1155_1 = require("./abi/ERC1155");
__createBinding(exports, ERC1155_1, "ERC1155");
var StaticCheckTxOrigin_1 = require("./abi/StaticCheckTxOrigin");
__createBinding(exports, StaticCheckTxOrigin_1, "StaticCheckTxOrigin");
var StaticCheckCheezeWizards_1 = require("./abi/StaticCheckCheezeWizards");
__createBinding(exports, StaticCheckCheezeWizards_1, "StaticCheckCheezeWizards");
var StaticCheckDecentralandEstates_1 = require("./abi/StaticCheckDecentralandEstates");
__createBinding(exports, StaticCheckDecentralandEstates_1, "StaticCheckDecentralandEstates");
var CheezeWizardsBasicTournament_1 = require("./abi/CheezeWizardsBasicTournament");
__createBinding(exports, CheezeWizardsBasicTournament_1, "CheezeWizardsBasicTournament");
var DecentralandEstates_1 = require("./abi/DecentralandEstates");
__createBinding(exports, DecentralandEstates_1, "DecentralandEstates");
var CanonicalWETH_1 = require("./abi/CanonicalWETH");
__createBinding(exports, CanonicalWETH_1, "CanonicalWETH");
var WrappedNFT_1 = require("./abi/WrappedNFT");
__createBinding(exports, WrappedNFT_1, "WrappedNFT");
var WrappedNFTFactory_1 = require("./abi/WrappedNFTFactory");
__createBinding(exports, WrappedNFTFactory_1, "WrappedNFTFactory");
var WrappedNFTLiquidationProxy_1 = require("./abi/WrappedNFTLiquidationProxy");
__createBinding(exports, WrappedNFTLiquidationProxy_1, "WrappedNFTLiquidationProxy");
var UniswapFactory_1 = require("./abi/UniswapFactory");
__createBinding(exports, UniswapFactory_1, "UniswapFactory");
var UniswapExchange_1 = require("./abi/UniswapExchange");
__createBinding(exports, UniswapExchange_1, "UniswapExchange");
