/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
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

// export const getAllProducts = async (query: Record<string, string>) => {
//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const skip = (page - 1) * limit;
//     const categoryQuery = query.category?.toUpperCase();

//     const search = query.search || "";
//     // const category = query.category;
//     const brand = query.brand;
//     const minPrice = Number(query.minPrice);
//     const maxPrice = Number(query.maxPrice);

//     const userInputSort = query.sort || "-createdAt";
//     const sortField = userInputSort.startsWith("-")
//         ? userInputSort.substring(1)
//         : userInputSort;

//     let sort = "-createdAt";
//     if (allowedProductSortFields.includes(sortField)) {
//         sort = userInputSort;
//     }

//     const filter: any = {};
//     filter.isDeleted = { $ne: true }; //excluding soft deleted products

//     if (search) {
//         filter.$or = [
//             { title: { $regex: search, $options: "i" } },
//             { brand: { $regex: search, $options: "i" } },
//             { description: { $regex: search, $options: "i" } },
//         ];
//     }
//     if (brand) filter.brand = brand;



//     if (categoryQuery) {
//         const main = await Category.findOne({ name: categoryQuery });

//         if (main) {
//             if (!main.parent) {
//                 // It's a main category → get all subcategories
//                 const subs = await Category.find({ parent: main._id }); const subNames = subs.map((c) => c.name);

//                 filter.category = { $in: [main.name, ...subNames] };
//             } else {
//                 // It's a subcategory
//                 filter.category = main.name;
//             }
//         }
//     }

//     // ----------------------------
//     // ⭐ DYNAMIC PRICE FILTER ⭐
//     // ----------------------------
//     if (!isNaN(minPrice) || !isNaN(maxPrice)) {
//         filter.$expr = {
//             $and: [
//                 !isNaN(minPrice)
//                     ? {
//                         $gte: [
//                             { $ifNull: ["$discountPrice", "$price"] },
//                             minPrice,
//                         ],
//                     }
//                     : {},
//                 !isNaN(maxPrice)
//                     ? {
//                         $lte: [
//                             { $ifNull: ["$discountPrice", "$price"] },
//                             maxPrice,
//                         ],
//                     }
//                     : {},
//             ],
//         };
//     }

//     // GET PRODUCTS
//     const products = await Product.find(filter)
//         .sort(sort)
//         .skip(skip)
//         .limit(limit)
//         .lean();

//     // ---------------------------
//     // ❗ Correct count using AGGREGATE
//     // ---------------------------
//     const countResult = await Product.aggregate([
//         { $match: filter },
//         { $count: "total" },
//     ]);

//     const totalProducts = countResult[0]?.total || 0;
//     const totalPage = Math.ceil(totalProducts / limit);

//     return {
//         data: products,
//         meta: {
//             page,
//             limit,
//             totalPage,
//             total: totalProducts,
//         },
//     };
// };


const getAllProducts = async (query: Record<string, string>) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = (query.search || "").trim();

    const brand = query.brand;
    const minPrice = Number(query.minPrice);
    const maxPrice = Number(query.maxPrice);
    const categoryQuery = query.category?.toUpperCase();

    // 1. Determine Sort logic
    const userInputSort = query.sort || "-createdAt";
    const isDescending = userInputSort.startsWith("-");
    let sortField = isDescending ? userInputSort.substring(1) : userInputSort;
    if (!allowedProductSortFields.includes(sortField)) {
        sortField = "createdAt";
    }
    const sortOrder = isDescending ? -1 : 1;

    // ----- BASE FILTER -----
    const matchFilter: any = {
        isDeleted: { $ne: true },
    };

    // ----- SEARCH -----
    if (search) {
        matchFilter.$or = [
            { title: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    if (brand) matchFilter.brand = brand;

    // ----- CATEGORY LOGIC (Keep your existing async logic) -----
    if (categoryQuery) {
        const main = await Category.findOne({ name: categoryQuery });
        if (main) {
            if (!main.parent) {
                const subs = await Category.find({ parent: main._id });
                const subNames = subs.map(c => c.name);
                matchFilter.category = { $in: [main.name, ...subNames] };
            } else {
                matchFilter.category = main.name;
            }
        }
    }

    // ----- BUILD AGGREGATION PIPELINE -----
    const pipeline: any[] = [
        { $match: matchFilter },
        // 2. ⭐ CREATE THE EFFECTIVE PRICE FIELD ⭐
        {
            $addFields: {
                effectivePrice: { $ifNull: ["$discountPrice", "$price"] }
            }
        }
    ];

    // 3. ⭐ APPLY PRICE RANGE ON THE CALCULATED FIELD ⭐
    const priceExpr: any[] = [];
    if (!isNaN(minPrice)) priceExpr.push({ $gte: ["$effectivePrice", minPrice] });
    if (!isNaN(maxPrice)) priceExpr.push({ $lte: ["$effectivePrice", maxPrice] });

    if (priceExpr.length > 0) {
        pipeline.push({ $match: { $expr: { $and: priceExpr } } });
    }

    // 4. ⭐ HANDLE CONDITIONAL SORTING ⭐
    const sortObj: any = {};
    if (sortField === "price") {
        // If user wants to sort by price, use our computed effectivePrice
        sortObj["effectivePrice"] = sortOrder;
    } else {
        sortObj[sortField] = sortOrder;
    }
    pipeline.push({ $sort: sortObj });

    // 5. PAGINATION & EXECUTION
    // We use a facet to get both total count and paginated data in one query
    const result = await Product.aggregate([
        ...pipeline,
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: skip }, { $limit: limit }]
            }
        }
    ]);

    const products = result[0]?.data || [];
    const total = result[0]?.metadata[0]?.total || 0;

    return {
        data: products,
        meta: {
            page,
            limit,
            totalPage: Math.ceil(total / limit),
            total,
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
        throw new AppError(404, "Product Not Found");
    }
    return product;
};

const getSingleProductBySlug = async (slug: string) => {
    const product = await Product.findOne({ slug });

    if (!product || product.isDeleted) {
        throw new AppError(404, "Product Not Found");
    }

    return product;
};






export const ProductServices = {
    createProduct,
    getAllProducts,
    deleteProduct,
    getSingleProduct,
    getSingleProductBySlug
}