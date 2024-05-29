const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./dbConfig/db'); 
const authRouter = require('./routes/authRoutes')
const cookieParser = require('cookie-parser');
const itemRoutes = require('./routes/itemRoutes')
const bidRoutes = require('./routes/bidRoutes')

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"));


// Connect with Database
db.pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to the database');
  connection.release();
});

app.use("/users",authRouter)
app.use("/items",itemRoutes)
app.use("/items",bidRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
