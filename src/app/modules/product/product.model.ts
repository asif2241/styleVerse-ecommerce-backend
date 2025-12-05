/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model } from "mongoose";
import { GENDER, IProduct } from "./product.interface";

const sizeVariantSchema = new Schema(
    {
        size: { type: String, required: true },
        quantity: { type: Number, required: true },
        isInStock: { type: Boolean, default: true },
    },
    { _id: false }
);

const productSchema = new Schema<IProduct>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        slug: {
            type: String,
            unique: true,
        },

        description: {
            type: String,
            required: true,
        },

        images: {
            type: [String],
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        discountPrice: Number,

        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        brand: String,

        sizes: {
            type: [sizeVariantSchema],
            required: true,
        },

        color: {
            type: String,
            required: true,
        },

        material: String,

        gender: {
            type: String,
            enum: Object.values(GENDER),
            required: true,
        },

        averageRating: {
            type: Number,
            default: 0,
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },

        sku: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

/* ----------------------------------------------
   CREATE: auto-generate unique slug
------------------------------------------------- */
productSchema.pre("save", async function () {
    if (this.isModified("title") || !this.slug) {
        const baseSlug = this.title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
        let slug = baseSlug;
        let counter = 1;

        while (await Product.exists({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter++}`;
        }

        this.slug = slug;
    }
});



productSchema.pre("save", async function () {
    if (this.isModified("title") || !this.slug) {
        const baseSlug = this.title
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");

        let slug = baseSlug;
        let counter = 1;

        // Check for duplicate slugs, excluding current document
        while (await Product.exists({ slug, _id: { $ne: this._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = slug;
    }
});

productSchema.pre("findOneAndUpdate", async function () {
    const update = this.getUpdate() as Partial<IProduct>;

    if (update.title) {
        const baseSlug = update.title
            .toLowerCase()
            .replace(/ /g, "-")
            .replace(/[^\w-]+/g, "");
        let slug = baseSlug;
        let counter = 1;

        // Exclude current doc
        const currentDoc = await this.model.findOne(this.getQuery());

        while (await Product.exists({ slug, _id: { $ne: currentDoc?._id } })) {
            slug = `${baseSlug}-${counter++}`;
        }

        update.slug = slug;
        this.setUpdate(update);
    }
});



export const Product = model<IProduct>("Product", productSchema);
