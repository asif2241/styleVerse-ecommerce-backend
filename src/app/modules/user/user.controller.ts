/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
import { UserServices } from "./user.service";

const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await UserServices.createUser(req.body);

    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: "User created successfully",
        data: user
    })
})

//get all user
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;

    const result = await UserServices.getAllUsers(query as Record<string, string>);
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "All Users Retrived Successfully",
        data: result.data,
        meta: result.meta
    })
})

const getSingleUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const result = await UserServices.getSingleUser(id);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "User retrieved successfully",
        data: result.data
    })
})

const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    const payload = req.body;
    const verifiedToken = req.user;

    const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: "User updated successfully",
        data: user
    })
})


const getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;

    const result = await UserServices.getMe(decodedToken as JwtPayload)
    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "User Retrieve Successfully",
        data: result.data
    })
})

const blockUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    // console.log(id);
    const decodedToken = req.user;

    const result = await UserServices.blockUser(id, decodedToken as JwtPayload);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User Blocked Successfully",
        data: result
    })
})

const unBlockUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    console.log(id);
    const result = await UserServices.unBlockUser(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User Unblocked Successfully",
        data: result
    })
})

export const UserController = {
    createUser,
    getAllUsers,
    getSingleUser,
    updateUser,
    blockUser,
    unBlockUser,
    getMe
}