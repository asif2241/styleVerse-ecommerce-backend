import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { OrderService } from "./order.service";
import { sendResponse } from "../../utils/sendResponse";

const createOrder = catchAsync(async (req: Request, res: Response) => {
    const decodeToken = req.user as JwtPayload
    // console.log(req.body);
    const order = await OrderService.createOrder(req.body, decodeToken.userId);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Booking created successfully",
        data: order,
    });
});


const getAllOrdersFromDB = catchAsync(async (req, res) => {
    const decodedToken = req.user
    const result = await OrderService.getAllOrdersFromDB(req.query as Record<string, string>, decodedToken);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Orders retrieved successfully",
        meta: result.meta,
        data: result.data,
    });
});

const getSingleOrderById = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.orderId
    const decodeToken = req.user
    const result = await OrderService.getSingleOrderById(orderId, decodeToken);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Order details retrieved successfully",
        data: result,
    });
});

export const OrderController = {
    createOrder,
    getAllOrdersFromDB,
    getSingleOrderById
}