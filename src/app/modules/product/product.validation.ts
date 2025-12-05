import { z } from "zod";
import { GENDER } from "./product.interface";

// Size variant schema
const sizeVariantZodSchema = z.object({
    size: z.string().min(1, "Size is required"),
    quantity: z.number().min(0, "Quantity must be a positive number"),
    isInStock: z.boolean().optional().default(true),
});

// Create product schema
export const createProductZodSchema = z.object({
    title: z.string().min(1, "Title is required").trim(),
    description: z.string().min(1, "Description is required"),

    price: z.number().positive("Price must be greater than 0"),
    discountPrice: z.number().positive().optional(),
    category: z.string().min(1, "Category is required"),
    brand: z.string().optional(),
    sizes: z.array(sizeVariantZodSchema).min(1, "At least one size is required"),
    color: z.string().min(1, "Color is required"),
    material: z.string().optional(),
    // gender: z
    //     .enum(Object.values(GENDER), {
    //         error: "Invalid Gender Type"
    //     }),
    gender: z.string(),
    isFeatured: z.boolean().optional().default(false),
    sku: z.string().min(1, "SKU is required").toUpperCase(),
}).refine(
    (data) => {
        if (data.discountPrice) {
            return data.discountPrice < data.price;
        }
        return true;
    },
    {
        message: "Discount price must be less than regular price",
        path: ["discountPrice"],
    }
);

// Update product schema
export const updateProductZodSchema = z.object({
    title: z.string().min(1, "Title is required").trim().optional(),
    description: z.string().min(1, "Description is required").optional(),
    images: z.array(z.string()).optional(),
    price: z.number().positive("Price must be greater than 0").optional(),
    discountPrice: z.number().positive().optional(),
    category: z.string().optional(),
    brand: z.string().optional(),
    sizes: z.array(sizeVariantZodSchema).optional(),
    color: z.string().optional(),
    material: z.string().optional(),
    gender: z
        .enum(GENDER, {
            error: "Invalid Role Type"
        }).optional(),
    isFeatured: z.boolean().optional(),
    sku: z.string().optional(),
    deleteImages: z.array(z.string()).optional(),
}).refine(
    (data) => {
        if (data.discountPrice && data.price) {
            return data.discountPrice < data.price;
        }
        return true;
    },
    {
        message: "Discount price must be less than regular price",
        path: ["discountPrice"],
    }
);