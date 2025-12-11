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


export const OrderController = {
    createOrder
}