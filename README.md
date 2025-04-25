# Clothing Store Website - General Description

This website is an online platform for a modern clothing store, offering customers a convenient, secure and comprehensive shopping experience. The website allows users to browse product details, make secure purchases, contact the store directly, view its location, and stay up to date with the business's policies. In addition, there is a dedicated management system for the store manager.

## Main features of the website

### 1. **Homepage**
- Displays all clothing items available for sale.
- Each item is displayed as an image that can be clicked on to go to the details and purchase page.
- Each item includes a name, description, price, additional images, available colors and available sizes.

### 2. **Product Details Screen**
- Displays an enlarged image of the product.
- Select color, size and quantity.
- Add to cart button.

### 3. **Shopping Cart Page**
- Displays all products that the customer has added to the cart.
- Allows updating quantity or removing items.
- Overall summary of total price by quantity.
- Secure payment button.

### 4. **Payment screens**
- Secure purchase process via PayPal (via API).
- Upon completion of the purchase:
- An order certificate is generated for the customer.
- A copy of the certificate is sent to the business.
- The order is added to the orders page for backup and management purposes.

### 5. **Store location screen**
- Displays the physical location of the store on a map.

### 6. **Contact screen**
- Displays all contact information for the store.
- Includes a direct link to WhatsApp for quick and easy contact.

### 7. **Policy and cancellations page**
- Displays all the business's policies regarding deliveries, returns, cancellations, and more.

---

## Agree to the site administrator

### 1. **Administrator login screen**
- Login to the link: http://localhost:3000/admin_login.html
- Password requirement (fixed password: `12345`) for login.

### 2. **Order management page**
- Displays all orders placed by customers.
- Allows viewing the details of each order for tracking and management.

### 3. **Product management page**
- Displays all existing products on the site including ID, price, colors and sizes.
- Allows:
- Editing product details.
- Adding a new product.
- Deleting an existing product.
- Updating colors, prices or sizes that are out of stock.

---

## Technologies used
- **Front-End:** HTML, CSS, JavaScript
- **Back-End:** Node.js + Express
- **Templates:** EJS
- **Data storage:** JSON files for customers, products and orders
- **Payments:** PayPal API

---

## Information security
- Payment screens are carried out through a secure external platform.
- Management access is provided only via password.

---

## Purpose
The site is designed to offer an easy, convenient and intuitive shopping experience while maintaining the security of the customer's information and simple management on the part of the business owner.

------------------------------------------------------------------------------------------------------------

## 🚀 How to run the project:
1. Download the files or clone from the repo.
2. Install the dependencies (if there is a package.json file):
```bash
npm install
3. Run the server: node server.js
4. Open the browser at: http://localhost:3000
