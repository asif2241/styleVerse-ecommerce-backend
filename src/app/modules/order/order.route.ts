import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { OrderController } from "./order.controller";

export const OrderRoutes = Router();

OrderRoutes.post("/", checkAuth(...Object.values(Role)),
    OrderController.createOrder)

OrderRoutes.get("/all-orders", checkAuth(...Object.values(Role)), OrderController.getAllOrdersFromDB)

OrderRoutes.get("/:orderId", checkAuth(...Object.values(Role)), OrderController.getSingleOrderById)