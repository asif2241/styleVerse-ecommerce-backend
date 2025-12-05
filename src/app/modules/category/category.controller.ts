/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { categoryServices } from "./category.service";
import { sendResponse } from "../../utils/sendResponse";

const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user;
    const category = await categoryServices.createCategory(req.body, decodedToken)
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Category created successfully!",
        data: category
    })
})


const getAllCategories = catchAsync(async (req, res) => {
    const result = await categoryServices.getAllCategories();

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Categories retrieved successfully!",
        data: result,
    });
});

const getSingleCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await categoryServices.getSingleCategory(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Category retrieved successfully!",
        data: result,
    });
});

const updateCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await categoryServices.updateCategory(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Category updated successfully!",
        data: result,
    });
});

const deleteCategory = catchAsync(async (req, res) => {
    const { id } = req.params;
    const result = await categoryServices.deleteCategory(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Category deleted successfully!",
        data: result,
    });
});

export const categoryController = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};