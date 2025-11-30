import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import { isActive, IUser } from "../modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import { User } from "../modules/user/user.model";
import AppError from "../errorHelpers/AppError";

export const createUserTokens = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id,
        email: user.email,
        role: user.role
    }

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);

    const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES)

    return {
        accessToken,
        refreshToken
    }
}

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {
    const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;

    const isUserExists = await User.findOne({ email: verifiedRefreshToken.email })

    if (!isUserExists) {
        throw new AppError(400, "User does not exists")
    }
    if (isUserExists.isActive === isActive.INACTIVE) {
        throw new AppError(400, `User is ${isUserExists.isActive}`)
    }

    if (isUserExists.isDeleted) {
        throw new AppError(400, "User is deleted")
    }

    if (isUserExists.isBlocked) {
        throw new AppError(400, "User is Blocked")
    }

    const jwtPayload = {
        userId: isUserExists._id,
        email: isUserExists.email,
        role: isUserExists.role
    }

    const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES)

    return accessToken
}