import { Types } from "mongoose";

export interface sizeVariantDTO {
    size: string,
    quantity: number,
    isInStock?: boolean
}

// export enum CATEGORY {
//     MEN = "MEN",
//     WOMEN = "WOMEN",
//     FOOTWEAR = "FOOTWEAR",
//     KIDS = "KIDS",
//     ACCESSORIES = "ACCESSORIES"
// }

// export enum SUB_CATEGORY {

// }

export enum GENDER {
    MEN = "MEN",
    WOMEN = "WOMEN",
    KIDS = "KIDS",
    UNISEX = "UNISEX"
}

export interface IProduct {
    _id?: string,
    title: string,
    slug: string,
    description: string,
    price: number,
    discountPrice?: number,
    category: Types.ObjectId;
    brand?: string,
    sizes: sizeVariantDTO[],
    images: string[],
    color: string,
    material?: string,
    gender: GENDER,
    averageRating?: string,
    isFeatured: boolean,
    sku: string,
    isDeleted: boolean,
    deleteImages?: string[]
}