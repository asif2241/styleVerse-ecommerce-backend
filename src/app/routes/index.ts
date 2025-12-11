import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoute } from "../modules/category/category.route";
import { ProductRoutes } from "../modules/product/product.route";
import { OrderRoutes } from "../modules/order/order.route";
import { PaymentRoutes } from "../modules/payment/payment.route";


export const router = Router()

const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/category",
        route: CategoryRoute
    },
    {
        path: "/products",
        route: ProductRoutes
    },
    {
        path: "/order",
        route: OrderRoutes
    },
    {
        path: "/payment",
        route: PaymentRoutes
    }
]


moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})