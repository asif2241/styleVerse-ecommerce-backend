/* eslint-disable @typescript-eslint/no-explicit-any */
import { Category } from "../category/category.model";
import { IProduct } from "./product.interface";
import { Product } from "./product.model";

const createProduct = async (payload: IProduct) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { category, ...rest } = payload;
    const searchedCategory = await Category.findOne({ name: category.toUpperCase() })
    console.log(searchedCategory);
    const product = await Product.create(payload)

    return product;
};


const allowedProductSortFields = [
    "price",
    "createdAt",

];

export const getAllProducts = async (query: Record<string, string>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const categoryQuery = query.category?.toUpperCase();

    const search = query.search || "";
    // const category = query.category;
    const brand = query.brand;
    const minPrice = Number(query.minPrice);
    const maxPrice = Number(query.maxPrice);

    const userInputSort = query.sort || "-createdAt";
    const sortField = userInputSort.startsWith("-")
        ? userInputSort.substring(1)
        : userInputSort;

    let sort = "-createdAt";
    if (allowedProductSortFields.includes(sortField)) {
        sort = userInputSort;
    }

    const filter: any = {};
    filter.isDeleted = { $ne: true }; //excluding soft deleted products

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }
    if (brand) filter.brand = brand;



    if (categoryQuery) {
        const main = await Category.findOne({ name: categoryQuery });

        if (main) {
            if (!main.parent) {
                // It's a main category → get all subcategories
                const subs = await Category.find({ parent: main._id }); const subNames = subs.map((c) => c.name);

                filter.category = { $in: [main.name, ...subNames] };
            } else {
                // It's a subcategory
                filter.category = main.name;
            }
        }
    }

    // ----------------------------
    // ⭐ DYNAMIC PRICE FILTER ⭐
    // ----------------------------
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
        filter.$expr = {
            $and: [
                !isNaN(minPrice)
                    ? {
                        $gte: [
                            { $ifNull: ["$discountPrice", "$price"] },
                            minPrice,
                        ],
                    }
                    : {},
                !isNaN(maxPrice)
                    ? {
                        $lte: [
                            { $ifNull: ["$discountPrice", "$price"] },
                            maxPrice,
                        ],
                    }
                    : {},
            ],
        };
    }

    // GET PRODUCTS
    const products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

    // ---------------------------
    // ❗ Correct count using AGGREGATE
    // ---------------------------
    const countResult = await Product.aggregate([
        { $match: filter },
        { $count: "total" },
    ]);

    const totalProducts = countResult[0]?.total || 0;
    const totalPage = Math.ceil(totalProducts / limit);

    return {
        data: products,
        meta: {
            page,
            limit,
            totalPage,
            total: totalProducts,
        },
    };
};

const deleteProduct = async (productId: string) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new Error("Product not found");
    }

    // Soft delete
    product.isDeleted = true;
    await product.save();

    return product;
};

const getSingleProduct = async (productId: string) => {
    const product = await Product.findById(productId);

    if (!product || product.isDeleted) {
        throw new Error("Product not found");
    }
    return product;
};





export const ProductServices = {
    createProduct,
    getAllProducts,
    deleteProduct,
    getSingleProduct
}