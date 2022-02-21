'use strict'

const db = require('./../settings/db')
const response = require('./../response')
const moment = require('moment')

exports.login = (req, res) => {
    console.log(req.query)
    db.query("SELECT id, username, password FROM admin WHERE username='" + req.query.username + "' AND password='" + req.query.password + "'", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            if (typeof rows !== 'undefined' && rows.length > 0)
                response.status(200, "Авторизация прошла успешно!", res)
            else
                response.status(401, error, res)
        }
    })
}

const getTotalCount = (res, table) => {
    return new Promise(resolve => {
        db.query("SELECT COUNT(*) AS totalCount FROM " + table, (error, rows, fields) => {
            if (error) {
                response.status(400, error, res)
            } else {
                resolve(rows[0].totalCount);
            }
        })
    });
}

exports.getAllUsers = async (req, res) => {
    const totalCount = await getTotalCount(res, "users");
    db.query("SELECT user_id AS id, email, user_name, surname, status, date_births, place_work_study, direction_work_study FROM users", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.set('Access-Control-Expose-Headers', "X-Total-Count");
            res.set('X-Total-Count', totalCount);
            res.json(rows)
        }
    })
}

exports.getAllBooks = async (req, res) => {
    const totalCount = await getTotalCount(res, "books");
    db.query("SELECT book_id AS id, book_name, author, year_publication, age_restrictions, type_book FROM books", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.set('Access-Control-Expose-Headers', "X-Total-Count");
            res.set('X-Total-Count', totalCount);
            res.json(rows)
        }
    })
}

exports.getAllComments = async (req, res) => {
    const totalCount = await getTotalCount(res, "comments");
    db.query("SELECT comment_id AS id, book_id, user_id, comment_type, comment_text, date FROM comments", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.set('Access-Control-Expose-Headers', "X-Total-Count");
            res.set('X-Total-Count', totalCount);
            res.json(rows)
        }
    })
}

exports.getDataComment = async (req, res) => {
    let commentId = req.params["commentId"];
    db.query("SELECT comment_id AS id, book_id, user_id, comment_type, comment_text, date FROM comments WHERE comment_id=" + commentId, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.json(rows[0])
        }
    })
}

exports.updateComment = async (req, res) => {
    const commentId = req.params["commentId"];
    console.log(req.body)
    db.query("UPDATE comments SET book_id=" + req.body.book_id + ", comment_type='" + req.body.comment_type + "', comment_text='" + req.body.comment_text + "', date='" + moment(req.body.date).format('YYYY-MM-DD') + "' WHERE comment_id=" + commentId, (error, rows, fields) => {
        if (error) {
            console.log(error)
        } else {
            db.query("SELECT comment_id AS id, book_id, user_id, comment_type, comment_text, date FROM comments WHERE comment_id=" + commentId, (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    res.json(rows[0])
                }
            })
        }
    })
}