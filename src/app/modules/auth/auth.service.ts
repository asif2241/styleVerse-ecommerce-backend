/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { createNewAccessTokenWithRefreshToken, createUserTokens } from "../../utils/userTokens";
import { IAuthProvider, IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs"
import { envVars } from "../../config/env";
// import { sendEmail } from "../../utils/sendEmail";

const credentialsLogin = async (payload: Partial<IUser>) => {
    const { email, password } = payload;

    const isUserExists = await User.findOne({ email })

    if (!isUserExists) {
        throw new AppError(400, "Email does not exists")
    }

    //ইউজার গুগল দিয়ে একাউন্ত করেছে কিনা চেক করা 
    const isGoogleAuthenticated = isUserExists.auths.some(providerObjects => providerObjects.provider == "google")

    if (isGoogleAuthenticated && !isUserExists.password) {
        throw new AppError(400, "You have authenticated through google. So if you want to login with credentials, then first login with google and set password for your gmail and the you can login with email and password")
    }

    const isPasswordMatched = await bcryptjs.compare(password as string, isUserExists.password as string)
    if (!isPasswordMatched) {
        throw new AppError(400, "Incorrect password")
    }

    const userTokens = createUserTokens(isUserExists)

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: pass, ...rest } = isUserExists.toObject()

    return {
        userTokens,
        user: rest
    }
}

const getNewAccessToken = async (refreshToken: string) => {
    const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);

    return {
        accessToken: newAccessToken
    }
}

const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
    const user = await User.findById(decodedToken.userId)

    const isOldPasswordMatched = await bcryptjs.compare(oldPassword, user?.password as string)
    if (!isOldPasswordMatched) {
        throw new AppError(400, "Old Password does not matched!")
    }

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

    user?.save()
}

const setPassword = async (plainPassword: string, decodedToken: JwtPayload) => {
    const user = await User.findById(decodedToken.userId);
    if (!user) {
        throw new AppError(400, "User not found")
    }

    if (user.password && user.auths.some(providerObject => providerObject.provider === "google")) {
        throw new AppError(403, "You have already set your password. Now you can change your password from your profile password update")
    }

    const hashedPassword = await bcryptjs.hash(plainPassword, Number(envVars.BCRYPT_SALT_ROUND))

    const credentialProvider: IAuthProvider = {
        provider: "credentials",
        providerId: user.email
    }
    const auths: IAuthProvider[] = [...user.auths, credentialProvider]

    user.password = hashedPassword;
    user.auths = auths;
    await user.save()

}



// const forgotPassword = async (email: string) => {
//     const isUserExists = await User.findOne({ email });
//     if (!isUserExists) {
//         throw new AppError(404, "User does not exist")
//     }
//     // if (!isUserExists.isVerified) {
//     //     throw new AppError(404, "User is not verified")
//     // }

//     if (isUserExists.isActive === isActive.INACTIVE) {
//         throw new AppError(401, `User is ${isUserExists.isActive}`)
//     }
//     if (isUserExists.isDeleted) {
//         throw new AppError(401, "User is deleted")
//     }
//     if (isUserExists.isBlocked) {
//         throw new AppError(401, "User is Blocked")
//     }


//     const JwtPayload = {
//         userId: isUserExists._id,
//         email: isUserExists.email,
//         role: isUserExists.role
//     }

//     const resetToken = jwt.sign(JwtPayload, envVars.JWT_ACCESS_SECRET, {
//         expiresIn: "10m"
//     })
//     const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExists._id}&toke=${resetToken}`

//     sendEmail({
//         to: isUserExists.email,
//         subject: "Password Reset",
//         templateName: "forgotPassword",
//         templateData: {
//             name: isUserExists.name,
//             resetUILink
//         }
//     })

//     // **
//     //  * http://localhost:5173/reset-password?id=687f310c724151eb2fcf0c41&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdmMzEwYzcyNDE1MWViMmZjZjBjNDEiLCJlbWFpbCI6InNhbWluaXNyYXI2QGdtYWlsLmNvbSIsInJvbGUiOiJVU0VSIiwiaWF0IjoxNzUzMTY2MTM3LCJleHAiOjE3NTMxNjY3Mzd9.LQgXBmyBpEPpAQyPjDNPL4m2xLF4XomfUPfoxeG0MKg
//     //  *
// }

// const resetPassword = async (payload: Record<string, any>, decodedToken: JwtPayload) => {
//     if (payload._id !== decodedToken.userId) {
//         throw new AppError(401, "You cannot reset password")
//     }

//     const isUserExists = await User.findById(decodedToken.userId)
//     if (!isUserExists) {
//         throw new AppError(401, "User does not exist")
//     }

//     const hashedPassword = await bcryptjs.hash(payload.newPassword, Number(envVars.BCRYPT_SALT_ROUND))

//     isUserExists.password = hashedPassword;
//     await isUserExists.save()
// }

export const AuthServices = {
    credentialsLogin,
    getNewAccessToken,
    changePassword,
    setPassword,

}