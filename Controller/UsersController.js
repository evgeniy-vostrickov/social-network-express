'use strict'

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const response = require('./../response')
const db = require('./../settings/db')
const config = require('./../config')


exports.getAllUsers = (req, res) => {
    // console.log(req.user[0].user_id)
    db.query('SELECT `user_id`, `user_name`, `surname`, `email` FROM `users`', (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}

exports.signup = (req, res) => {
    db.query("SELECT `user_id`, `email`, `user_name` FROM `users` WHERE `email` = '" + req.body.email + "'", (error, rows, fields) => {
        // console.log(rows)
        // response.status(400, error, res)
        if (error) {
            response.status(400, error, res)
        } else if (typeof rows !== 'undefined' && rows.length > 0) {
            console.log(rows)
            const row = JSON.parse(JSON.stringify(rows))
            row.map(rw => {
                response.status(302, { message: `Пользователь с таким email - ${rw.email} уже зарегстрирован!` }, res)
                return true
            })
        } else {
            const name = req.body.name
            const surname = req.body.surname !== '' ? req.body.surname : 'Не указано'
            const email = req.body.email

            const salt = bcrypt.genSaltSync(15)
            const password = bcrypt.hashSync(req.body.password, salt)

            const sql = "INSERT INTO `users`(`user_name`, `surname`, `email`, `password`) VALUES('" + name + "', '" + surname + "', '" + email + "', '" + password + "')";
            db.query(sql, (error, results) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    response.status(200, { message: `Регистрация прошла успешно.`, results }, res)
                }
            })
        }
    })
}

exports.signin = (req, res) => {
    db.query("SELECT `user_id`, `email`, `password` FROM `users` WHERE `email` = '" + req.body.email + "'", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else if (rows.length <= 0) {
            response.status(401, { message: `Пользователь с email - ${req.body.email} не найден. Пройдите регистрацию.` }, res)
        } else {
            const row = JSON.parse(JSON.stringify(rows))
            row.map(rw => {
                const password = bcrypt.compareSync(req.body.password, rw.password)
                if (password) {
                    //Если true мы пускаем юзера и генерируем токен
                    const token = jwt.sign({
                        userId: rw.user_id,
                        email: rw.email
                    }, config.jwt, { expiresIn: 120 * 60 })

                    response.status(200, { token: `Bearer ${token}` }, res)

                } else {
                    //Выкидываем ошибку что пароль не верный
                    response.status(401, { message: `Пароль не верный.` }, res)

                }
                return true
            })
        }
    })
}

exports.me = (req, res) => {
    // console.log(req.user[0].user_id)
    db.query("SELECT user_id, user_name, surname, email, status, avatar, date_births, place_work_study, direction_work_study FROM users WHERE user_id=" + req.user[0].user_id + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}