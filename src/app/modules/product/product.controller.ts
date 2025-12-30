/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { IProduct } from "./product.interface";
import { sendResponse } from "../../utils/sendResponse";
import { ProductServices } from "./product.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
    const payload: IProduct = {
        ...req.body,
        images: (req.files as Express.Multer.File[]).map(file => file.path)
    }
    const result = await ProductServices.createProduct(payload);
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Tour created successfully',
        data: result,
    });
});

const getAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await ProductServices.getAllProducts(query as Record<string, string>)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Products retrieve successfully!",
        data: result.data,
        meta: result.meta
    })
})


const deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    const result = await ProductServices.deleteProduct(productId)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product deleted successfully!",
        data: result,
    })
})


const getSingleProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const productId = req.params.id;

    const result = await ProductServices.getSingleProduct(productId)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product retrivied successfully!",
        data: result,
    })
})

const getSingleProductBySlug = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const slug = req.params.slug;

    const result = await ProductServices.getSingleProductBySlug(slug)
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Product retrivied successfully!",
        data: result,
    })
})


export const ProductController = {
    createProduct,
    getAllProducts,
    deleteProduct,
    getSingleProduct,
    getSingleProductBySlug
}