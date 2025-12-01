import { Router } from "express";
import { UserController } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
// import { validateRequest } from "../../middlewares/validateRequest";
// import { createUserZodSchema, updateUserZodSchema } from "./user.validation";

export const UserRoutes = Router();

UserRoutes.post("/register",
    //  validateRequest(createUserZodSchema),
    UserController.createUser)
UserRoutes.get("/all-users", checkAuth(Role.SUPER_ADMIN, Role.ADMIN), UserController.getAllUsers)
UserRoutes.get("/me", checkAuth(...Object.values(Role)), UserController.getMe)
UserRoutes.get("/:id", UserController.getSingleUser)
UserRoutes.patch("/:id",
    //  validateRequest(updateUserZodSchema),
    checkAuth(...Object.values(Role)), UserController.updateUser)


UserRoutes.patch("/block/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.blockUser)
UserRoutes.patch("/unblock/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserController.unBlockUser)