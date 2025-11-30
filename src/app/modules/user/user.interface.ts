import { Types } from "mongoose";

export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER",

}

export interface IAuthProvider {
    provider: "google" | "credentials";
    providerId: string;
}

export enum isActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    address?: string;
    role: Role;
    isActive?: isActive;
    isBlocked?: boolean;
    blockedBy?: Types.ObjectId;
    isVerified?: boolean;
    isDeleted?: boolean;
    auths: IAuthProvider[]
}