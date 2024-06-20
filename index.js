const express = require("express");
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
app.use(cors());
app.use(express.json());
require('./upload')(app);

app.listen(`${process.env.PORT}`, () => {
    console.log('Google Sheet Nimbus API Port : ' + `${process.env.PORT}`);
});

app.get('/', (request, response) => {
    response.json({ info: 'Google Sheet Nimbus API' });
    console.log({ info: 'Google Sheet Nimbus API' });
});