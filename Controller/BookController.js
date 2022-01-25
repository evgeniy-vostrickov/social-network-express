'use strict'

const response = require('./../response')
const db = require('./../settings/db')
const moment = require('moment')

exports.getPayloadForAddBook = (req, res) => {
    db.query("SELECT * FROM genres", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            const genres = rows;
            db.query("SELECT * FROM publish", (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    const publish = rows;
                    db.query("SELECT * FROM languages", (error, rows, fields) => {
                        if (error) {
                            response.status(400, error, res)
                        } else {
                            const languages = rows;
                            response.status(200, { genres, publish, languages }, res)
                        }
                    })
                }
            })
        }
    })
}
exports.addNewBook = (req, res) => {
    // Меняем двойной обратный слэш на одинарный обычный в пути к файлу, что бы можно было записать в бд и считать в нормальной форме
    req.file.path = req.file.path.replace("\\","/")
    db.query("INSERT INTO `books`(`book_name`, `author`, `year_publication`, `language_id`, `book_description`, `illustration_cover`, `genre_id`, `publish_id`, `age_restrictions`) VALUES('" + req.body.book_name + "', '" + req.body.author + "', '" + req.body.year_publication + "', '" + req.body.language_id + "', '" + req.body.book_description + "', '" + req.file.path + "', '" + req.body.genre_id + "', '" + req.body.publish_id + "', '" + req.body.age_restrictions + "')", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
            // console.log(error)
        } else {
            response.status(200, {book_id: rows.insertId, illustration_cover: req.file.path, ...req.body}, res)
            // console.log(rows)
        }
    })
}
exports.getAdditionalDataBook = (req, res) => {
    db.query("SELECT genre_name FROM genres WHERE genre_id=" + req.query.genre, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            const genre_name = rows[0].genre_name;
            db.query("SELECT publish_name FROM publish WHERE publish_id=" + req.query.publish, (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    const publish_name = rows[0].publish_name;
                    db.query("SELECT language_name FROM languages WHERE language_id=" + req.query.language, (error, rows, fields) => {
                        if (error) {
                            response.status(400, error, res)
                        } else {
                            const language_name = rows[0].language_name;
                            response.status(200, { genre_name, publish_name, language_name }, res)
                        }
                    })
                }
            })
        }
    })
}
exports.getFullInfoBook = (req, res) => {
    db.query("SELECT * FROM books WHERE book_id=" + req.query.book, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}
exports.getAllComments =(req, res) => {
    db.query("SELECT temp_bd.comment_id, temp_bd.comment_text, user_name, surname, avatar, temp_bd.date FROM (SELECT * FROM comments WHERE book_id=" + req.query.book + " AND comment_type='" + req.query.comment + "') AS temp_bd LEFT JOIN users ON temp_bd.user_id=users.user_id", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}
exports.addNewComment = (req, res) => {
    const id = req.user[0].user_id;
    db.query("INSERT INTO `comments`(`book_id`, `comment_type`, `comment_text`, `date`, `user_id`) VALUES('" + req.query.book + "', '" + req.query.comment + "', '" + req.body.comment + "', '" + moment().format('YYYY-MM-DD') + "', '" + id + "')", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            db.query("SELECT temp_bd.comment_id, temp_bd.comment_text, user_name, surname, avatar, temp_bd.date FROM (SELECT * FROM comments WHERE book_id=" + req.query.book + " AND comment_type='" + req.query.comment + "') AS temp_bd LEFT JOIN users ON temp_bd.user_id=users.user_id WHERE temp_bd.comment_id=" + rows.insertId, (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    response.status(200, rows, res)
                }
            })
        }
    })
}
exports.addBookInDiaryReader = (req, res) => {
    const id = req.user[0].user_id;
    db.query("INSERT INTO `diary_reader`(`user_id`, `book_id`, `type_book`) VALUES('" + id + "', '" + req.query.book + "', '" + req.body.sectionDiary + "')", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}
exports.getAllBooks = (req, res) => {
    const count = req.query.count;
    const page = req.query.page;
    const beginTakeBook = (parseInt(page) - 1) * parseInt(count);
    let totalCount = 0; //количество записей в базе данных
    db.query("SELECT COUNT(*) AS totalCount FROM books", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            totalCount = rows[0].totalCount;
        }
    })
    db.query("SELECT * FROM books LIMIT " + beginTakeBook + ", " + count + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, {rows, totalCount}, res)
        }
    })
}