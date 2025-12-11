/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "../../errorHelpers/AppError";
import { ORDER_STATUS } from "../order/order.interface";
import { Order } from "../order/order.model";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { PAYMENT_STATUS } from "./payment.interface";
import { Payment } from "./payment.model";



const initPayment = async (orderId: string) => {

    const payment = await Payment.findOne({ orderId: orderId })

    if (!payment) {
        throw new AppError(404, "Payment Not Found. You have not booked this tour")
    }

    const order = await Order.findById(payment.orderId)

    const userAddress = (order?.user as any).address
    const userEmail = (order?.user as any).email
    const userPhoneNumber = (order?.user as any).phone
    const userName = (order?.user as any).name

    const sslPayload: ISSLCommerz = {
        address: userAddress,
        email: userEmail,
        phoneNumber: userPhoneNumber,
        name: userName,
        amount: payment.amount,
        transactionId: payment.transactionId
    }

    const sslPayment = await SSLService.sslPaymentInit(sslPayload)

    return {
        paymentUrl: sslPayment.GatewayPageURL
    }
};

const successPayment = async (query: Record<string, string>) => {

    // Update Booking Status to COnfirm 
    // Update Payment Status to PAID

    const session = await Order.startSession();
    session.startTransaction()

    try {


        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.PAID,
        }, { new: true, runValidators: true, session: session })

        if (!updatedPayment) {
            throw new AppError(401, "Payment not found")
        }

        const updatedOrder = await Order
            .findByIdAndUpdate(
                updatedPayment?.orderId,
                { status: ORDER_STATUS.COMPLETE },
                { new: true, runValidators: true, session }
            )
            .populate({
                path: "products.product",
                select: "title"
            })
            .populate("user", "name email")

        if (!updatedOrder) {
            throw new AppError(401, "Booking not found")
        }

        // const invoiceData: IInvoiceData = {
        //     bookingDate: updatedBooking.createdAt as Date,
        //     guestCount: updatedBooking.guestCount,
        //     totalAmount: updatedPayment.amount,
        //     tourTitle: (updatedBooking.tour as unknown as ITour).title,
        //     transactionId: updatedPayment.transactionId,
        //     userName: (updatedBooking.user as unknown as IUser).name
        // }

        // const pdfBuffer = await generatePdf(invoiceData)

        // const cloudinaryResult = await uploadBufferToCloudinary(pdfBuffer, "invoice")

        // if (!cloudinaryResult) {
        //     throw new AppError(401, "Error uploading pdf")
        // }

        // await Payment.findByIdAndUpdate(updatedPayment._id, { invoiceUrl: cloudinaryResult.secure_url }, { runValidators: true, session })

        // await sendEmail({
        //     to: (updatedBooking.user as unknown as IUser).email,
        //     subject: "Your Booking Invoice",
        //     templateName: "invoice",
        //     templateData: invoiceData,
        //     attachments: [
        //         {
        //             filename: "invoice.pdf",
        //             content: pdfBuffer,
        //             contentType: "application/pdf"
        //         }
        //     ]
        // })

        await session.commitTransaction(); //transaction
        session.endSession()
        return { success: true, message: "Payment Completed Successfully" }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error
    }
};
const failPayment = async (query: Record<string, string>) => {

    // Update Booking Status to FAIL
    // Update Payment Status to FAIL

    const session = await Order.startSession();
    session.startTransaction()

    try {


        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.FAILED,
        }, { new: true, runValidators: true, session: session })

        await Order
            .findByIdAndUpdate(
                updatedPayment?.orderId,
                { status: ORDER_STATUS.FAILED },
                { runValidators: true, session }
            )

        await session.commitTransaction(); //transaction
        session.endSession()
        return { success: false, message: "Payment Failed" }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error
    }
};
const cancelPayment = async (query: Record<string, string>) => {

    // Update Booking Status to CANCEL
    // Update Payment Status to CANCEL

    const session = await Order.startSession();
    session.startTransaction()

    try {


        const updatedPayment = await Payment.findOneAndUpdate({ transactionId: query.transactionId }, {
            status: PAYMENT_STATUS.CANCELLED,
        }, { runValidators: true, session: session })

        await Order
            .findByIdAndUpdate(
                updatedPayment?.orderId,
                { status: ORDER_STATUS.CANCEL },
                { runValidators: true, session }
            )

        await session.commitTransaction(); //transaction
        session.endSession()
        return { success: false, message: "Payment Cancelled" }
    } catch (error) {
        await session.abortTransaction(); // rollback
        session.endSession()
        // throw new AppError(httpStatus.BAD_REQUEST, error) ❌❌
        throw error
    }
};

// const getInvoiceDownloadUrl = async (paymentId: string) => {
//     const payment = await Payment.findById(paymentId)
//         .select("invoiceUrl")

//     if (!payment) {
//         throw new AppError(401, "Payment not found")
//     }

//     if (!payment.invoiceUrl) {
//         throw new AppError(401, "No invoice found")
//     }

//     return payment.invoiceUrl
// };


export const PaymentServices = {
    initPayment,
    successPayment,
    failPayment,
    cancelPayment
}