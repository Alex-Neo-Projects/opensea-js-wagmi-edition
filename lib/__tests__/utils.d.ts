import { OrderV2 } from "../orders/types";
export declare const areTimestampsNearlyEqual: (timestampA: number, timestampB: number, buffer?: number) => boolean;
export declare const expectValidOrder: (order: OrderV2) => void;
