/* eslint-disable @typescript-eslint/no-explicit-any */
import { model, Schema } from "mongoose";
import { IOrder, IOrderProduct, ORDER_STATUS } from "./order.interface";
import { Product } from "../product/product.model";
import AppError from "../../errorHelpers/AppError";

const OrderProductSchema = new Schema<IOrderProduct>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  size: {
    type: String,
    required: true
  }
});

// Main Order Schema
const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: {
      type: [OrderProductSchema],
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliveryCharge: {
      type: Number,
      default: 0
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
    },

    shippingAddress: {
      type: String,
      required: true,
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt & updatedAt
  }
);




OrderSchema.pre("validate", async function (this: any) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const order = this;

  let totalAmount = 0;

  for (const item of order.products) {
    const product = await Product.findById(item.product);

    if (!product) {
      throw new AppError(404, `Product with ID ${item.product} not found!`);
    }

    // Check if product is deleted
    if (product.isDeleted) {
      throw new AppError(400, `Product "${product.title}" is no longer available!`);
    }

    // Find the size variant
    const sizeVariant = product.sizes.find((s: any) => s.size === item.size);

    if (!sizeVariant) {
      throw new AppError(
        400,
        `Size "${item.size}" is not available for product "${product.title}"`
      );
    }

    // Check if size is in stock
    if (!sizeVariant.isInStock) {
      throw new AppError(
        400,
        `Size "${item.size}" for product "${product.title}" is out of stock`
      );
    }

    // Check if sufficient quantity is available
    if (sizeVariant.quantity < item.quantity) {
      throw new AppError(
        400,
        `Only ${sizeVariant.quantity} units available for size "${item.size}" of "${product.title}". You requested ${item.quantity}`
      );
    }

    const productPrice = product.discountPrice ?? product.price;

    item.unitPrice = Number(productPrice);

    totalAmount += productPrice * item.quantity;
  }

  const isDhaka = order.shippingAddress?.toLowerCase().includes("dhaka");
  const deliveryCharge = isDhaka ? 60 : 120;

  order.totalAmount = totalAmount;
  order.deliveryCharge = deliveryCharge;
  order.discount = order.discount || 0;
  order.finalAmount = totalAmount - order.discount + deliveryCharge;
});




export const Order = model<IOrder>("Order", OrderSchema);
