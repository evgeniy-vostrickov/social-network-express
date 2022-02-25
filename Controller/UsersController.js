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
                    // response.status(200, { message: `Регистрация прошла успешно.`, results }, res)
                    const token = jwt.sign({
                        userId: results.insertId,
                        email: email
                    }, config.jwt, { expiresIn: 120 * 60 })

                    response.status(200, { token: `Bearer ${token}` }, res)
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
    db.query("SELECT user_id, user_name, surname, email, status, avatar, DATE_FORMAT(date_births, '%d.%m.%Y') AS date_births, place_work_study, direction_work_study FROM users WHERE user_id=" + req.user[0].user_id + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}

exports.getAllUsers = (req, res) => {
    const id = req.user[0].user_id;
    const count = req.query.count;
    const page = req.query.page;
    const beginTakeUser = (parseInt(page) - 1) * parseInt(count);
    let totalCount = 0; //количество записей в базе данных
    db.query("SELECT COUNT(*) AS totalCount FROM users", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            totalCount = rows[0].totalCount;
            totalCount = parseInt(totalCount) - 1; //вычитаем пользователя который посылает запрос
        }
    })
    db.query("SELECT user_id, email, user_name, surname, avatar, place_work_study FROM users WHERE user_id NOT IN (" + id + ") LIMIT " + beginTakeUser + ", " + count + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            let users = rows;
            response.status(200, { users, totalCount }, res)
        }
    })
}

exports.foundUsers = (req, res) => {
    const count = req.query.count;
    const page = req.query.page;
    const beginTakeUser = (parseInt(page) - 1) * parseInt(count);
    let totalCount = 0; //количество записей в базе данных
    let users = null; //найденные записи
    db.query("SELECT COUNT(*) AS totalCount FROM (SELECT user_id, LOCATE('" + req.query.searchField + "', surname) as pos FROM users) AS temp_table WHERE temp_table.pos>0", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            totalCount = rows[0].totalCount;
        }
    })
    db.query("SELECT COUNT(*) AS totalCount FROM (SELECT user_id, LOCATE('" + req.query.searchField + "', user_name) as pos FROM users) AS temp_table WHERE temp_table.pos>0", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            totalCount = parseInt(totalCount) + parseInt(rows[0].totalCount);
        }
    })
    db.query("SELECT user_id, email, user_name, surname, avatar, place_work_study FROM (SELECT *, LOCATE('" + req.query.searchField + "', surname) as pos FROM users) AS temp_table WHERE temp_table.pos>0 LIMIT " + beginTakeUser + ", " + count + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            users = rows;
        }
    })
    db.query("SELECT user_id, email, user_name, surname, avatar, place_work_study FROM (SELECT *, LOCATE('" + req.query.searchField + "', user_name) as pos FROM users) AS temp_table WHERE temp_table.pos>0 LIMIT " + beginTakeUser + ", " + count + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            users = [...users, ...rows];
            response.status(200, { users, totalCount }, res)
        }
    })
}

exports.getFullInfoUser = (req, res) => {
    const id = req.query.user;
    let friends = null;
    let groups = null;
    let userInfo = null;
    db.query("SELECT users.user_name, users.surname, users.direction_work_study FROM (SELECT friends.first_user_id, friends.second_user_id FROM friends friends WHERE first_user_id=" + id + " OR second_user_id=" + id + ") AS f LEFT JOIN users ON (first_user_id=user_id AND user_id!=" + id + ") OR (second_user_id=user_id AND user_id!=" + id + ")", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            friends = rows;
        }
    })
    db.query("SELECT gn.group_name, gn.city FROM band_members bm LEFT JOIN group_network gn ON bm.group_id = gn.group_id WHERE bm.user_id=" + id + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            groups = rows;
        }
    })
    db.query("SELECT user_name, surname, email, status, avatar, DATE_FORMAT(date_births, '%d.%m.%Y'), place_work_study, direction_work_study FROM users WHERE user_id=" + id + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            userInfo = rows[0];
            response.status(200, {friends, groups, userInfo}, res)
        }
    })
}

exports.followUser = (req, res) => {
    const id = req.user[0].user_id;
    console.log(req.query.confirmation)
    if (req.query.confirmation != "false"){
        db.query("UPDATE friends SET confirmation='1' WHERE (first_user_id=" + id + " AND second_user_id=" + req.query.user + ") OR (first_user_id=" + req.query.user + " AND second_user_id=" + id + ")", (error, rows, fields) => {
            if (error) {
                response.status(400, error, res)
            } else {
                response.status(200, rows, res)
            }
        })
    } else {
        console.log("dsd")
        db.query("INSERT INTO `friends`(`first_user_id`, `second_user_id`, `confirmation`) VALUES('" + id + "', '" + req.query.user + "', '0')", (error, rows, fields) => {
            if (error) {
                response.status(400, error, res)
            } else {
                response.status(200, rows, res)
            }
        })
    }
}

exports.unfollowUser = (req, res) => {
    const id = req.user[0].user_id;
    db.query("DELETE FROM friends WHERE (first_user_id=" + id + " AND second_user_id=" + req.query.user + ") OR (first_user_id=" + req.query.user + " AND second_user_id=" + id + ")", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}