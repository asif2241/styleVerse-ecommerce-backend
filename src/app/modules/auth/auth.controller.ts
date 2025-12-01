/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { AuthServices } from "./auth.service";
import { setAuthCookie } from "../../utils/setAuthCookie";
import { sendResponse } from "../../utils/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { JwtPayload } from "jsonwebtoken";
import { createUserTokens } from "../../utils/userTokens";
import { envVars } from "../../config/env";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const loginInfo = await AuthServices.credentialsLogin(req.body);

    const { userTokens, user } = loginInfo;

    setAuthCookie(res, userTokens);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "User logged in successfully",
        data: {
            accessToken: userTokens.accessToken,
            refreshToken: userTokens.refreshToken,
            user: user
        }
    })
})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        throw new AppError(400, "No Refresh Token Received from cookies!")
    }

    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string);

    setAuthCookie(res, tokenInfo);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "New Access Token Retrive Successfully",
        data: tokenInfo
    })

})

const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none"
    })

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "User Logged Out Successfully",
        data: null
    })
})

const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;
    const decodedToken = req.user

    await AuthServices.changePassword(oldPassword, newPassword, decodedToken as JwtPayload)

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Password changed successfully",
        data: null
    })
})

const setPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const decodedToken = req.user as JwtPayload

    const { password } = req.body;

    await AuthServices.setPassword(password, decodedToken);

    sendResponse(res, {
        success: true,
        statusCode: 200,
        message: "Password setted successfully",
        data: null
    })
})


// const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

//     let redirectTo = req.query.state ? req.query.state as string : ""

//     if (redirectTo.startsWith("/")) {
//         redirectTo = redirectTo.slice(1)
//     }

//     const user = req.user;

//     if (!user) {
//         throw new AppError(400, "User not found")
//     }

//     const tokenInfo = createUserTokens(user)
//     setAuthCookie(res, tokenInfo)

//     res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
// })

// will implement  this later👇
// const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const { email } = req.body;

//     await AuthServices.forgotPassword(email)

//     sendResponse(res, {
//         success: true,
//         statusCode: 200,
//         message: "Email send successfully",
//         data: null
//     })
// })

// const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
//     const decodedToken = req.user;

//     await AuthServices.resetPassword(req.body, decodedToken as JwtPayload);

//     sendResponse(res, {
//         success: true,
//         statusCode: 200,
//         message: "Password Resetted successfully",
//         data: null
//     })
// })


export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logout,
    changePassword,
    setPassword,
    // resetPassword,
    // googleCallbackController,
    // forgotPassword
}