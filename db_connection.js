
const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

/*
const joystick_connection = new Pool
    ({
        user: `${process.env.JOYSTICK_USER_DB}`,
        host: `${process.env.JOYSTICK_HOST}`,
        database: `${process.env.JOYSTICK_DATABASE}`,
        password: `${process.env.JOYSTICK_PASSWORD}`,
        port: `${process.env.JOYSTICK_DB_PORT}`,
        ssl: true,
    });
*/
const db_connect = new Pool
    ({
        user: `${process.env.DB_USER}`,
        host: `${process.env.DB_HOST}`,
        database: `${process.env.DB_DATABASE}`,
        password: `${process.env.DB_PASSWORD}`,
        port: `${process.env.DB_PORT}`,
    });

/*
function joystick_client() {
    joystick_connection.query(`SELECT 1`, (err, res) => {
        if (err) {
            console_log(`Error connecting to {${process.env.JOYSTICK_HOST}}`);
            setTimeout(joystick_client, 60000);
        } else {
            console_log(`Successfully connected to {${process.env.JOYSTICK_HOST}}`);
        }
    });
}
*/
function db_client() {
    db_connect.query(`SELECT 1`, (err, res) => {
        if (err) {
            console.log(`Error connecting to {${process.env.DB_HOST}}`);
            setTimeout(db_client, 60000);
        } else {
            console.log(`Successfully connected to {${process.env.DB_HOST}}`);
        }
    });
}


//joystick_client();
db_client();



module.exports = {db_connect};