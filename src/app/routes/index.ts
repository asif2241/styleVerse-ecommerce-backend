import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { CategoryRoute } from "../modules/category/category.route";
import { ProductRoutes } from "../modules/product/product.route";


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
    }
]


moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})