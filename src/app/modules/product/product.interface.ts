
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
    category: string;
    brand?: string,
    sizes: sizeVariantDTO[],
    images: string[],
    color: string,
    material?: string,
    gender: GENDER,
    averageRating?: number,
    isFeatured: boolean,
    sku: string,
    isDeleted: boolean,
    deleteImages?: string[]
}