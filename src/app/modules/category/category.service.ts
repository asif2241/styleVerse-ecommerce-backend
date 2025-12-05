/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from "jsonwebtoken";
import { ICategory } from "./category.interface";
import { Category } from "./category.model";
import AppError from "../../errorHelpers/AppError";

const createCategory = async (payload: Partial<ICategory>, decodedToken: JwtPayload) => {
    const createdBy = decodedToken.userId;

    // Check if category exists with same name AND same parent
    const isCategoryExist = await Category.findOne({
        name: payload.name?.toUpperCase(),
        parent: payload.parent || null
    });

    if (isCategoryExist) {
        throw new AppError(403, "This Category already exists under this parent.");
    }

    const category = await Category.create({
        ...payload,
        createdBy
    });

    return category;
};


const getAllCategories = async () => {
    const categories = await Category.find({ isActive: true }).lean();

    const categoryMap: Record<string, any> = {};

    // Step 1: Initialize map
    categories.forEach(cat => {
        const id = String(cat._id); // Convert ObjectId → string
        categoryMap[id] = {
            _id: cat._id,
            name: cat.name,
            children: []
        };
    });

    const roots: any[] = [];

    // Step 2: Build tree
    categories.forEach(cat => {
        const id = String(cat._id);
        if (cat.parent) {
            const parentId = String(cat.parent);
            categoryMap[parentId]?.children.push(categoryMap[id]);
        } else {
            roots.push(categoryMap[id]);
        }
    });

    return roots;
};

const getSingleCategory = async (id: string) => {
    return await Category.findById(id).populate("parent");
};

const updateCategory = async (id: string, payload: Partial<ICategory>) => {
    return await Category.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
};

//will update this later, it should be soft delete 
const deleteCategory = async (id: string) => {
    return await Category.findByIdAndDelete(id);
};

export const categoryServices = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};