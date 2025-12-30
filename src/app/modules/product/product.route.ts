import { Router } from "express";
import { ProductController } from "./product.controller";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middlewares/validateRequest";
import { createProductZodSchema } from "./product.validation";

export const ProductRoutes = Router();

ProductRoutes.post("/create",
    multerUpload.array("files"),
    validateRequest(createProductZodSchema),
    ProductController.createProduct)

ProductRoutes.get("/", ProductController.getAllProducts)

// ProductRoutes.get("/:id", ProductController.getSingleProduct)
ProductRoutes.get("/:slug", ProductController.getSingleProductBySlug)
ProductRoutes.delete("/:id", ProductController.deleteProduct)