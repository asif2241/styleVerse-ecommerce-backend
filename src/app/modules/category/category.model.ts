import { model, Schema } from "mongoose";
import { ICategory } from "./category.interface";

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: "Category",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
})

export const Category = model<ICategory>("Category", categorySchema)
