/* eslint-disable @typescript-eslint/no-explicit-any */
import { Order } from "./order.model";
import { Payment } from "../payment/payment.model";
// import { User } from "../user/user.model";
import { IOrder } from "./order.interface";
import { PAYMENT_STATUS } from "../payment/payment.interface";
import { ORDER_STATUS } from "./order.interface";
import AppError from "../../errorHelpers/AppError";
import { generateTransactionId } from "../../utils/generateTransactionId";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";


const createOrder = async (payload: Partial<IOrder>, userId: string) => {
    const transactionId = generateTransactionId();
    // console.log(payload);


    const session = await Order.startSession();
    session.startTransaction();

    try {
        // const user = await User.findById(userId);

        // if (!user?.phone || !user.address) {
        //     throw new AppError(
        //         403,
        //         "Please update your profile with phone and address to place an order."
        //     );
        // }


        if (!payload.products || payload.products.length === 0) {
            throw new AppError(
                403,
                "Order must contain at least one product."
            );
        }

        const order = await Order.create([{
            user: userId,
            status: ORDER_STATUS.PENDING,
            ...payload
        }], { session });

        const finalAmount = order[0].finalAmount;

        if (!finalAmount || finalAmount < 1) {
            throw new AppError(
                403,
                "Invalid order amount!"
            );
        }

        const payment = await Payment.create([{
            orderId: order[0]._id,
            status: PAYMENT_STATUS.UNPAID,
            transactionId: transactionId,
            amount: finalAmount
        }], { session });

        const updatedOrder = await Order
            .findByIdAndUpdate(
                order[0]._id,
                { payment: payment[0]._id },
                { new: true, runValidators: true, session }
            )
            .populate("user", "name email phone address")
            .populate("products.product", "title images price discountPrice brand category")
            .populate("payment");

        if (!updatedOrder) {
            throw new AppError(404, "Order not found after creation.");
        }

        const userInfo = updatedOrder.user as any;

        const sslPayload: ISSLCommerz = {
            address: userInfo.address,
            email: userInfo.email,
            phoneNumber: userInfo.phone,
            name: userInfo.name,
            amount: finalAmount,
            transactionId: transactionId
        };

        const sslPayment = await SSLService.sslPaymentInit(sslPayload);

        if (!sslPayment?.GatewayPageURL) {
            throw new AppError(
                403,
                "Failed to initialize SSL payment."
            );
        }

        await session.commitTransaction();
        session.endSession();

        return {
            paymentUrl: sslPayment.GatewayPageURL,
            order: updatedOrder
        };

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

export const OrderService = {
    createOrder
};
