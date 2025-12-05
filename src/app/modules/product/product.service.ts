import { IProduct } from "./product.interface";
import { Product } from "./product.model";

const createProduct = async (payload: IProduct) => {
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

    const search = query.search || "";
    const category = query.category;
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

    const filter: Record<string, any> = {};

    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } }
        ];
    }

    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    if (!isNaN(minPrice)) {
        filter.price = { ...filter.price, $gte: minPrice };
    }
    if (!isNaN(maxPrice)) {
        filter.price = { ...filter.price, $lte: maxPrice };
    }

    let products = await Product.find(filter)
        .populate("category", "name")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

    // Convert category object → name string
    products = products.map((p) => ({
        ...p,
        category: p.category?.name || null,
    }));

    const totalProducts = await Product.countDocuments(filter);
    const totalPage = Math.ceil(totalProducts / limit);

    const meta = {
        page,
        limit,
        totalPage,
        total: totalProducts,
    };

    return {
        data: products,
        meta,
    };
};




export const ProductServices = {
    createProduct,
    getAllProducts
}