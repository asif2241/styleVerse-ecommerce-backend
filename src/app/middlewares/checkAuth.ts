import { NextFunction, Request, Response } from "express";
import AppError from "../errorHelpers/AppError";
import { verifyToken } from "../utils/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import { isActive } from "../modules/user/user.interface";

export const checkAuth = (...authRoles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.headers.authorization || req.cookies.accessToken

        if (!accessToken) {
            throw new AppError(403, "No Token Received")
        }

        const verifiedToken = verifyToken(accessToken, envVars.JWT_ACCESS_SECRET) as JwtPayload

        const isUserExists = await User.findOne({ email: verifiedToken.email })

        if (!isUserExists) {
            throw new AppError(400, "User does not exist")
        }

        if (isUserExists.isActive === isActive.INACTIVE) {
            throw new AppError(400, `User is ${isUserExists.isActive}`)
        }

        if (isUserExists.isBlocked) {
            throw new AppError(400, "User is Blocked!")
        }

        if (isUserExists.isDeleted) {
            throw new AppError(400, "User is deleted")
        }


        if (!authRoles.includes(verifiedToken.role)) {
            throw new AppError(403, "You are not permitted to view this route!!!")
        }
        // console.log(verifiedToken);
        req.user = verifiedToken
        next()

    } catch (error) {
        console.log("jwt error", error);
        next(error)
    }
}