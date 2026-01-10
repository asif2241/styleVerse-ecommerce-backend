# STYLEVERSE ECOMMERCE PLATFORM

#### **StyleVerse** is a modern full-stack eCommerce web application designed to deliver a seamless online shopping experience. It supports secure user authentication, product browsing, cart management, order processing, online payments, and user account management with a scalable and modular backend architecture.

---

## Core Features

- **🔐 Secure Authentication:** Implements **JWT (JSON Web Token)** based authentication with secure password hashing using bcrypt, ensuring safe user login and session management.

- **🛍️ Product Management System:** Browse products by category, brand, and price range with support for search, filtering, and pagination for better user experience.

- **🛒 Shopping Cart & Checkout:** Users can add products to cart, update quantities, apply pricing logic (discounts), and proceed through a structured checkout process.

- **💳 SSLCommerz Payment Gateway Integration:** Secure online payment processing using **SSLCommerz**, supporting multiple payment methods including cards, mobile banking, and internet banking with real-time payment validation.

- **📦 Order Management:** Customers can place orders, view order history, and track order status, while the system maintains accurate inventory updates.

- **👤 User Dashboard:** Registered users have access to a personal dashboard where they can view **order history**, check order statuses, and manage their **profile information**.

- **⚙️ Admin Dashboard:** Admins can manage products, categories, users, orders, and payments, update order statuses, and maintain overall platform operations efficiently.

---

## ⚙️ **Technologies Used:**

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Validation**: Zod
- **Authentication**: JWT, Role-based auth
- **File Upload**: Multer + Cloudinary
- **Password Hashing**: Bcyptjs
- **Others**: TypeScript, Dotenv, ESLint, Postman, Cors, Cookie-parser

---

## **API DETAILS**:

### 🔐 **Authentication Related API**

| **Method** | **Endpoints**         | **Description**                                    | **Access**            |
| ---------- | --------------------- | -------------------------------------------------- | --------------------- |
| _POST_     | /auth/login           | Register a new user                                | Public                |
| _POST_     | /auth/refresh-token   | Create a new Access Token With Refresh Toke        | ADMIN,SENDER,RECEIVER |
| _POST_     | /auth/logout          | Logout a LoggedIn User                             | ADMIN,SENDER,RECEIVER |
| _POST_     | /auth/change-password | Changing Password                                  | ADMIN,SENDER,RECEIVER |
| _POST_     | /auth/set-password    | Google Registered User Can Set Password            | ADMIN,SENDER,RECEIVER |
| _POST_     | /auth/forgot-password | OTP sent to Password Forgotted Users               | ADMIN,SENDER,RECEIVER |
| _POST_     | /auth/reset-password  | Users who forgot their password can reset password | ADMIN,SENDER,RECEIVER |

---

### 🚚 **PRODUCTS Related API**

| **Method** | **Endpoints**    | **Description**                                 | **Access**         |
| ---------- | ---------------- | ----------------------------------------------- | ------------------ |
| _POST_     | /products/create | Add A New Product to The Database               | ADMIN, SUPER_ADMIN |
| _GET_      | /products        | Accessible by All Users.                        | ALL                |
| _GET_      | /products/:id    | Retrive a single product by id                  | All User           |
| _PATCH_    | /products/:id    | Admins can update a products                    | Admin              |
| _DELETE_   | /products/:id    | Admins can delete a product from DB by this API | Admin              |

---

### 👮 **USER RELATED API:**

| **Method** | **Endpoints**   | **Description**               | **Access**                           |
| ---------- | --------------- | ----------------------------- | ------------------------------------ |
| _POST_     | /user/register  | Register a New User           | PUBLIC                               |
| _GET_      | /user/all-users | Retrive All Users             | ADMIN, SUPER_ADMIN                   |
| _GET_      | /user/me        | Retrive a Authenticated User  | ADMIN, SUPER_ADMIN, SENDER, RECEIVER |
| _PATCH_    | /user/:id       | User can update their profile | ADMIN, SUPER_ADMIN, SENDER, RECEIVER |
| _PATCH_    | /block/:id      | Admins can block any user     | ADMIN, SUPER_ADMIN                   |
| _PATCH_    | /unBlock/:id    | Admins can unblock any user   | ADMIN, SUPER_ADMIN                   |

---

## Setup & Usage Instructions

Follow the steps below to set up and run the **StyleVerse eCommerce Platform** locally.

---

### Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud – MongoDB Atlas)
- **Git**

---

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/asif2241/styleVerse-ecommerce-backend.git
   cd styleverse-ecommerce
   ```
2. **Install The Dependencies**
   ```bash
   npm install
   ```
3. **To Run The Project**
   ```bash
   npm run dev
   ```

### LIVE LINK : https://style-verse-backend.vercel.app/
