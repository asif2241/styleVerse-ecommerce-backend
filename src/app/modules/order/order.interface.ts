import { Types } from 'mongoose';

export interface IOrderProduct {
    product: Types.ObjectId;
    quantity: number;
    size: string;
    unitPrice: number;
}

export enum ORDER_STATUS {
    PENDING = "PENDING",
    CANCEL = "CANCEL",
    COMPLETE = "COMPLETE",
    FAILED = "FAILED"
}


export interface IOrder {
    user: Types.ObjectId;
    products: IOrderProduct[];
    totalAmount: number;
    discount: number;
    deliveryCharge: number;
    finalAmount: number;
    status: ORDER_STATUS;
    shippingAddress: string;
    createdAt?: Date;
    updatedAt?: Date;
    payment?: Types.ObjectId;
}