'use strict'

const db = require('./../settings/db')
const response = require('./../response')
const moment = require('moment')
const fs = require('fs');

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
    let dopParametr = "";
    if (req.query._start) {
        const start = req.query._start;
        const end = req.query._end;
        const order = req.query._order;
        const sort = req.query._sort;
        const count = parseInt(end) - parseInt(start);
        dopParametr = "ORDER BY " + sort + " " + order + " LIMIT " + start + ", " + count + "";
    }
    db.query("SELECT user_id AS id, email, user_name, surname, status, date_births, place_work_study, direction_work_study FROM users " + dopParametr, (error, rows, fields) => {
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
    let dopParametr = "";
    if (req.query._start) {
        const start = req.query._start;
        const end = req.query._end;
        const order = req.query._order;
        const sort = req.query._sort;
        const count = parseInt(end) - parseInt(start);
        dopParametr = "ORDER BY " + sort + " " + order + " LIMIT " + start + ", " + count + "";
    }
    db.query("SELECT book_id AS id, book_name, author, year_publication, book_description, age_restrictions, type_book, genre_id FROM books " + dopParametr, (error, rows, fields) => {
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
    let dopParametr = "";
    if (req.query._start) {
        const start = req.query._start;
        const end = req.query._end;
        const order = req.query._order;
        const sort = req.query._sort;
        const count = parseInt(end) - parseInt(start);
        dopParametr = "ORDER BY " + sort + " " + order + " LIMIT " + start + ", " + count + "";
    }
    db.query("SELECT comment_id AS id, book_id, user_id, comment_type, comment_text, date FROM comments " + dopParametr, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.set('Access-Control-Expose-Headers', "X-Total-Count");
            res.set('X-Total-Count', totalCount);
            res.json(rows)
        }
    })
}

exports.getAllGroups = async (req, res) => {
    const totalCount = await getTotalCount(res, "group_network");
    let dopParametr = "";
    if (req.query._start) {
        const start = req.query._start;
        const end = req.query._end;
        const order = req.query._order;
        const sort = req.query._sort;
        const count = parseInt(end) - parseInt(start);
        dopParametr = "ORDER BY " + sort + " " + order + " LIMIT " + start + ", " + count + "";
    }
    db.query("SELECT group_id AS id, owner, group_name, group_description, city FROM group_network " + dopParametr, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.set('Access-Control-Expose-Headers', "X-Total-Count");
            res.set('X-Total-Count', totalCount);
            res.json(rows)
        }
    })
}

exports.getAllGenres = async (req, res) => {
    const totalCount = await getTotalCount(res, "genres");
    db.query("SELECT genre_id AS id, genre_name FROM genres", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.set('Access-Control-Expose-Headers', "X-Total-Count");
            res.set('X-Total-Count', totalCount);
            res.json(rows)
        }
    })
}

exports.getAllPublish = async (req, res) => {
    const totalCount = await getTotalCount(res, "publish");
    db.query("SELECT publish_id AS id, publish_name FROM publish", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.set('Access-Control-Expose-Headers', "X-Total-Count");
            res.set('X-Total-Count', totalCount);
            res.json(rows)
        }
    })
}

exports.getAllLanguages = async (req, res) => {
    const totalCount = await getTotalCount(res, "languages");
    db.query("SELECT language_id AS id, language_name FROM languages", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.set('Access-Control-Expose-Headers', "X-Total-Count");
            res.set('X-Total-Count', totalCount);
            res.json(rows)
        }
    })
}

exports.getDataComment = (req, res) => {
    const commentId = req.params["commentId"];
    db.query("SELECT comment_id AS id, book_id, user_id, comment_type, comment_text, date FROM comments WHERE comment_id=" + commentId, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.json(rows[0])
        }
    })
}

exports.updateComment = (req, res) => {
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

exports.deleteComment = (req, res) => {
    const commentId = req.params["commentId"];
    // console.log(req.body)
    db.query("DELETE FROM comments WHERE comment_id=" + commentId, (error, rows, fields) => {
        if (error) {
            console.log(error)
        } else {
            res.json({'id': commentId})
        }
    })
}

exports.getDataBook = (req, res) => {
    const bookId = req.params["bookId"];
    db.query("SELECT book_id AS id, book_name, author, year_publication, book_description, age_restrictions, type_book, genre_id, publish_id, language_id FROM books WHERE book_id=" + bookId, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.json(rows[0])
        }
    })
}

exports.updateBook = (req, res) => {
    const bookId = req.params["bookId"];
    // console.log(req.body)
    db.query("UPDATE books SET book_name='" + req.body.book_name + "', author='" + req.body.author + "', year_publication='" + req.body.year_publication + "', book_description='" + req.body.book_description + "', age_restrictions='" + req.body.age_restrictions + "', type_book='" + req.body.type_book + "', genre_id='" + req.body.genre_id + "', publish_id='" + req.body.publish_id + "', language_id='" + req.body.language_id + "' WHERE book_id=" + bookId, (error, rows, fields) => {
        if (error) {
            console.log(error)
        } else {
            db.query("SELECT book_id AS id, book_name, author, year_publication, book_description, age_restrictions, type_book FROM books WHERE book_id=" + bookId, (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    res.json(rows[0])
                }
            })
        }
    })
}

exports.createBook = (req, res) => {
    const bookId = req.params["bookId"];
    // console.log(req.body)

    const data = req.body.myFile.src.replace(/^data:image\/\w+;base64,/, "");
    const buf = Buffer.from(data, 'base64');
    const date = moment().format('DDMMYYYY-HHmmss_SSS')
    const pathIllustrationCover = `uploads/${date}-illustration.png`;
    fs.writeFile(pathIllustrationCover, buf, (err, result) => {
        if(err) console.log('error', err);
    });

    db.query("INSERT INTO `books`(`book_name`, `author`, `year_publication`, `language_id`, `book_description`, `illustration_cover`, `genre_id`, `publish_id`, `age_restrictions`) VALUES('" + req.body.book_name + "', '" + req.body.author + "', '" + req.body.year_publication + "', '" + req.body.language_id + "', '" + req.body.book_description + "', '" + pathIllustrationCover + "', '" + req.body.genre_id + "', '" + req.body.publish_id + "', '" + req.body.age_restrictions + "')", (error, rows, fields) => {
        if (error) {
            console.log(error)
        } else {
            db.query("SELECT book_id AS id, book_name, author, year_publication, book_description, age_restrictions, type_book FROM books WHERE book_id=" + rows.insertId, (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    res.json(rows[0])
                }
            })
        }
    })
}

exports.deleteBook = (req, res) => {
    const bookId = req.params["bookId"];
    // console.log(req.body)
    db.query("DELETE FROM books WHERE book_id=" + bookId, (error, rows, fields) => {
        if (error) {
            console.log(error)
        } else {
            res.json({'id': bookId})
        }
    })
}

exports.deleteGroup = (req, res) => {
    const groupId = req.params["groupId"];
    // console.log(req.body)
    db.query("DELETE FROM group_network WHERE group_id=" + groupId, (error, rows, fields) => {
        if (error) {
            console.log(error)
        } else {
            res.json({'id': groupId})
        }
    })
}

exports.getDataUser = (req, res) => {
    const userId = req.params["userId"];
    db.query("SELECT user_id AS id, email, user_name, surname, status, place_work_study, direction_work_study FROM users WHERE user_id=" + userId, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            res.json(rows[0])
        }
    })
}

exports.updateUser = (req, res) => {
    const userId = req.params["userId"];
    console.log(req.body)
    db.query("UPDATE users SET user_id=" + req.body.id + ", email='" + req.body.email + "', user_name='" + req.body.user_name + "', surname='" + req.body.surname + "', status='" + req.body.status + "', place_work_study='" + req.body.place_work_study + "', direction_work_study='" + req.body.direction_work_study + "' WHERE user_id=" + userId, (error, rows, fields) => {
        if (error) {
            console.log(error)
        } else {
            db.query("SELECT user_id AS id, email, user_name, surname, status, place_work_study, direction_work_study FROM users WHERE user_id=" + userId, (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    res.json(rows[0])
                }
            })
        }
    })
}

exports.deleteUser = (req, res) => {
    const userId = req.params["userId"];
    db.query("DELETE FROM users WHERE user_id=" + userId, (error, rows, fields) => {
        if (error) {
            console.log(error)
        } else {
            res.json({'id': userId})
        }
    })
}