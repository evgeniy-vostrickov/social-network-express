const mysql = require('mysql')
// const config = require('../config')
const config = require('../config')

const connection = mysql.createConnection({
    host: config.HOST,
    user: config.DBUSER,
    password: config.DBPASSWORD,
    database: config.DBNAME
})

// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'rest',
// })

connection.connect((error) => {
    if(error) {
        return console.log('Ошибка подключения к БД!');
    } else {
        return console.log('Подлючение успешно!');
    }
})

//!!! var exports = module.exports = {} !!!
module.exports = connection