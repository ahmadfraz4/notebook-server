require('dotenv').config();
require('./src/db/conn');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_PATH);
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });   
app.use(require('./src/routers/user'));
app.use('/notes',require('./src/routers/Notes'));



app.listen(port, () => {
  console.log(port);
});
