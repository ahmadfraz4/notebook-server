require('dotenv').config();
require('./src/db/conn');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_PATH,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(require('./src/routers/user'));
app.use('/notes', require('./src/routers/Notes'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
