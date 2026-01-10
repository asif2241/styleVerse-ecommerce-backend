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
import { User } from "../user/user.model";
import { JwtPayload } from "jsonwebtoken";
import { Role } from "../user/user.interface";
import mongoose from "mongoose";


const createOrder = async (payload: Partial<IOrder>, userId: string) => {
    const transactionId = generateTransactionId();
    // console.log(payload);


    const session = await Order.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId);

        // if (!user?.phone || !user.address) {
        //     throw new AppError(
        //         403,
        //         "Please update your profile with phone and address to place an order."
        //     );
        // }
        if (!user) {
            throw new AppError(
                403,
                "Please login first to create an order"
            );
        }


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
            .populate("user", "name email")
            .populate("products.product", "title images price discountPrice brand category")
            .populate("payment");

        if (!updatedOrder) {
            throw new AppError(404, "Order not found after creation.");
        }

        // const userInfo = updatedOrder.user as any;

        const sslPayload: ISSLCommerz = {
            address: payload.shippingAddress as string,
            email: payload.email as string,
            phoneNumber: payload.phone as string,
            name: payload.name as string,
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

const getAllOrdersFromDB = async (query: Record<string, string>, decodedToken: JwtPayload) => {
    const userRole = decodedToken.role;
    const userId = decodedToken.userId;
    // console.log(userId, userRole);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = (query.search || "").trim();
    const status = query.status?.toUpperCase();

    // 1. Sort Logic
    const allowedOrderSortFields = ["createdAt", "totalAmount", "finalAmount",];
    const userInputSort = query.sort || "-createdAt";
    const isDescending = userInputSort.startsWith("-");
    let sortField = isDescending ? userInputSort.substring(1) : userInputSort;

    if (!allowedOrderSortFields.includes(sortField)) {
        sortField = "createdAt";
    }
    const sortOrder = isDescending ? -1 : 1;

    // ----- BASE FILTER -----
    // Unlike products, orders usually don't have "isDeleted", 
    // but we can filter by specific fields if needed.
    const matchFilter: any = {};

    // If the user is a regular USER, they can only see their own orders.
    // ADMIN and SUPER_ADMIN will bypass this and see everything.
    if (userRole === Role.USER) {
        matchFilter.user = new mongoose.Types.ObjectId(userId);
    }

    // ----- SEARCH (Name, Email, Phone, or Address) -----
    if (search) {
        matchFilter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
            { shippingAddress: { $regex: search, $options: "i" } },
        ];
    }

    // ----- STATUS FILTER -----
    if (status && Object.values(ORDER_STATUS).includes(status as ORDER_STATUS)) {
        matchFilter.status = status;
    }



    // Prepare Sort Object
    const sortObj: any = {};
    sortObj[sortField] = sortOrder;
    // ----- PAGINATION & EXECUTION -----
    // ----- BUILD AGGREGATION PIPELINE -----
    const result = await Order.aggregate([
        { $match: matchFilter },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $sort: sortObj }, // Ensure sorting happens before pagination inside facet
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: "products",
                            localField: "products.product",
                            foreignField: "_id",
                            as: "productDetails"
                        }
                    }
                ]
            }
        }
    ]);

    const orders = result[0]?.data || [];
    const total = result[0]?.metadata[0]?.total || 0;

    return {
        data: orders,
        meta: {
            page,
            limit,
            totalPage: Math.ceil(total / limit),
            total,
        },
    };
};

const getSingleOrderById = async (orderId: string, decodeToken: JwtPayload) => {

    console.log(orderId);
    const result = await Order.findById(orderId)
        .populate("user", "name email phone") // Gets basic user info
        .populate({
            path: "products.product", // Deep populate for the product model
            select: "-_id title images price discountPrice" // Fields to include
        })
        .populate({
            path: "payment",
            select: "-_id transactionId status",
        });

    if (!result) {
        throw new AppError(404, "Order not found!");
    }

    if (decodeToken.role === Role.USER) {
        if (!result.user._id.equals(decodeToken.userId)) {
            throw new AppError(403, "You are not permitted to view this order details");
        }
    }

    return result;
};



export const OrderService = {
    createOrder,
    getAllOrdersFromDB,
    getSingleOrderById
};
