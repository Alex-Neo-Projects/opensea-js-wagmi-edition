"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectValidOrder = exports.areTimestampsNearlyEqual = void 0;
const chai_1 = require("chai");
const schemas_1 = require("../orders/schemas");
const areTimestampsNearlyEqual = (timestampA, timestampB, buffer = 5) => {
    return Math.abs(timestampA - timestampB) <= buffer;
};
exports.areTimestampsNearlyEqual = areTimestampsNearlyEqual;
const expectValidOrder = (order) => {
    const isOrderValid = (0, schemas_1.validateOrder)(order);
    (0, chai_1.expect)(isOrderValid, `Order type is invalid: ${JSON.stringify(schemas_1.validateOrder.errors)}`).to.be.true;
};
exports.expectValidOrder = expectValidOrder;
