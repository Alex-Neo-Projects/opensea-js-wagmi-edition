"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectValidOrder = exports.areTimestampsNearlyEqual = void 0;
var chai_1 = require("chai");
var schemas_1 = require("../orders/schemas");
var areTimestampsNearlyEqual = function (timestampA, timestampB, buffer) {
    if (buffer === void 0) { buffer = 5; }
    return Math.abs(timestampA - timestampB) <= buffer;
};
exports.areTimestampsNearlyEqual = areTimestampsNearlyEqual;
var expectValidOrder = function (order) {
    var isOrderValid = (0, schemas_1.validateOrder)(order);
    (0, chai_1.expect)(isOrderValid, "Order type is invalid: ".concat(JSON.stringify(schemas_1.validateOrder.errors))).to.be.true;
};
exports.expectValidOrder = expectValidOrder;
//# sourceMappingURL=utils.js.map