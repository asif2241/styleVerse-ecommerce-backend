import { Types } from "mongoose";

export interface ICategory {
    name: string;
    parent?: Types.ObjectId;
    isActive: boolean;
    createdBy: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}