# Bidding Backend

This is the backend server for a bidding application.


### Query to create database and tables

```query
    
CREATE DATABASE bidding_db;

USE bidding_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    starting_price DECIMAL(10, 2) NOT NULL,
    current_price DECIMAL(10, 2) DEFAULT starting_price,
    image_url VARCHAR(255),
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    user_id INT,
    bid_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message VARCHAR(255) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


```


## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Dependencies](#dependencies)
- [License](#license)
- [Author](#author)

## Introduction

The Bidding Backend is a Node.js server built using Express.js. It provides APIs for managing bidding-related operations such as creating auctions, placing bids, fetching items, and managing user authentication. The server uses MySQL as the database to store data related to auctions, users, and bids.

## Features

- User authentication using JSON Web Tokens (JWT)
- Creating and managing auctions
- Placing bids on items
- Fetching items with pagination
- Handling file uploads for item images using Multer and Cloudinary
- Rate limiting to prevent abuse

## Installation

To install and run the Bidding Backend server, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/bidding-backend.git
   ```

2. Navigate to the project directory:

   ```bash
   cd bidding-backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables:
   
   Create a `.env` file in the root directory and add the following variables:

   ```plaintext
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_DATABASE=bidding_db
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   Replace the values with your actual database and Cloudinary credentials.

5. Set up the database:
   
   Create a MySQL database with the name specified in the `.env` file (`bidding_db` by default). Then, run the SQL scripts located in the `dbScripts` directory to create the necessary tables.

6. Start the server:

   ```bash
   npm run dev
   ```

## Usage

Once the server is running, you can access the APIs using tools like Postman or integrate them into your frontend application.



# Bidding API

## register

- **Method**: POST
- **URL**: `localhost:5000/users/register`
- **Body**: 
```json
{
    "username":"{{$randomUserName}}",
    "email":"{{$randomEmail}}",
    "password":"password"
}
```

## login

- **Method**: POST
- **URL**: `localhost:5000/users/login`
- **Body**: 
```json
{
    "email":"Kyla55@hotmail.com",
    "password":"password"
}
```

## profile

- **Method**: GET
- **URL**: No additional information

# Change Password

## Request

- **Method**: POST
- **URL**: `localhost:5000/users/change-password`
- **Headers**: None
- **Body**:
  ```json
  {
      "oldPassword": "password",
      "newPassword": "newPassword"
  }
  ```

### Response

- **Status**: 200 OK
- **Body**: JSON message confirming that the password was changed successfully.



## add items

- **Method**: POST
- **URL**: `localhost:5000/users/items`
- **Body**:
  - `name`: Ancient Wine
  - `description`: description for ancient wine
  - `starting_price`: 200000
  - `end_time`: 2024-06-30T23:59:59Z
  - `image`: [File](postman-cloud:///1ef1d671-3253-4fe0-9e69-4ffbd6c946a7)

## get all items

- **Method**: GET
- **URL**: `localhost:5000/items/?page=1&limit=2`

## Get single item by Id

- **Method**: GET
- **URL**: `localhost:5000/items/4`

## update item

- **Method**: PUT
- **URL**: `localhost:5000/items/4`
- **Body**:
```json
{
    "current_price":"1234567"
}
```

## delete item

- **Method**: DELETE
- **URL**: `localhost:5000/items/5`

## add item for bid

- **Method**: POST
- **URL**: `localhost:5000/items/6/bids`
- **Body**:
```json
{
    "bid_amount":"200001"
}
```

## Get All Bids for Items

### Request

- **Method**: GET
- **URL**: `localhost:5000/items/6/bids`
- **Headers**: None

### Response

- **Status**: 200 OK
- **Body**: JSON array of bids for the specified item.

---

## Get Notifications

### Request

- **Method**: GET
- **URL**: `localhost:5000/notifications`
- **Headers**: None

### Response

- **Status**: 200 OK
- **Body**: JSON array of notifications for the logged-in user.

---

## Mark Notifications as Read

### Request

- **Method**: POST
- **URL**: `localhost:5000/notifications/mark-read`
- **Headers**: None

### Response

- **Status**: 200 OK
- **Body**: JSON message confirming that notifications were marked as read.



## Dependencies

- [bcryptjs](https://www.npmjs.com/package/bcryptjs): For password hashing and verification.
- [cloudinary](https://www.npmjs.com/package/cloudinary): For uploading images to Cloudinary.
- [cookie-parser](https://www.npmjs.com/package/cookie-parser): For parsing cookies in Express.
- [cors](https://www.npmjs.com/package/cors): For enabling CORS in Express middleware.
- [dotenv](https://www.npmjs.com/package/dotenv): For loading environment variables from a `.env` file.
- [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for Node.js.
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit): For rate limiting HTTP requests in Express middleware.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): For generating and verifying JSON Web Tokens (JWT).
- [multer](https://www.npmjs.com/package/multer): For handling file uploads in Express.
- [mysql2](https://www.npmjs.com/package/mysql2): MySQL client for Node.js.
- [nodemon](https://www.npmjs.com/package/nodemon): For automatically restarting the server during development.
- [socket.io](https://www.npmjs.com/package/socket.io): For enabling real-time bid updates using WebSockets.
- [ws](https://www.npmjs.com/package/ws): A fast, well-tested, WebSocket client and server for Node.js.

## License

This project is licensed under the [ISC License](LICENSE).

## Author

This backend server was created by [Dibyakanta Nayak](https://github.com/your-username).