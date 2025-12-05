import { Router } from "express";
import { categoryController } from "./category.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

export const CategoryRoute = Router();

CategoryRoute.post("/create", checkAuth(Role.SUPER_ADMIN), categoryController.createCategory);
CategoryRoute.get("/", categoryController.getAllCategories);
CategoryRoute.get("/:id", categoryController.getSingleCategory);
CategoryRoute.patch("/:id", categoryController.updateCategory);
CategoryRoute.delete("/:id", categoryController.deleteCategory);