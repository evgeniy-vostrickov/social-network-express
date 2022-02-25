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
    req.file.path = req.file.path.replace("\\", "/")
    db.query("INSERT INTO `books`(`book_name`, `author`, `year_publication`, `language_id`, `book_description`, `illustration_cover`, `genre_id`, `publish_id`, `age_restrictions`) VALUES('" + req.body.book_name + "', '" + req.body.author + "', '" + req.body.year_publication + "', '" + req.body.language_id + "', '" + req.body.book_description + "', '" + req.file.path + "', '" + req.body.genre_id + "', '" + req.body.publish_id + "', '" + req.body.age_restrictions + "')", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
            // console.log(error)
        } else {
            response.status(200, { book_id: rows.insertId, illustration_cover: req.file.path, ...req.body }, res)
            // console.log(rows)
        }
    })
}
exports.getAdditionalDataBook = (req, res) => {
    let genre_name = null;
    let publish_name = null;
    let language_name = null;
    db.query("SELECT genre_name FROM genres WHERE genre_id=" + req.query.genre, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            genre_name = rows[0].genre_name;
        }
    })
    db.query("SELECT publish_name FROM publish WHERE publish_id=" + req.query.publish, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            publish_name = rows[0].publish_name;
        }
    })
    db.query("SELECT language_name FROM languages WHERE language_id=" + req.query.language, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            language_name = rows[0].language_name;
            response.status(200, { genre_name, publish_name, language_name }, res)
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
exports.getStatisticsBook = (req, res) => {
    let pastBook = null;
    let wantBook = null;
    let reviews = null;
    let quotes = null;
    let dopComment = null;
    let nameComment = null;
    db.query("SELECT COUNT(*) AS pastBook FROM diary_reader WHERE book_id=" + req.query.book + " AND type_book='Прочитанные книги'", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            pastBook = rows[0].pastBook;
        }
    })
    db.query("SELECT COUNT(*) AS wantBook FROM diary_reader WHERE book_id=" + req.query.book + " AND type_book='Хочу прочитать'", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            wantBook = rows[0].wantBook;
        }
    })
    db.query("SELECT COUNT(*) AS reviews FROM comments WHERE book_id=" + req.query.book + " AND comment_type='Рецензия'", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            reviews = rows[0].reviews;
        }
    })
    db.query("SELECT COUNT(*) AS quotes FROM comments WHERE book_id=" + req.query.book + " AND comment_type='Цитаты'", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            quotes = rows[0].quotes;
        }
    })
    db.query("SELECT type_book FROM books WHERE book_id=" + req.query.book, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            let sql = "";
            switch (rows[0].type_book) {
                case "Для младших классов":
                    sql = "SELECT COUNT(*) AS count FROM comments WHERE book_id=" + req.query.book + " AND comment_type='Глоссарий'";
                    nameComment = "Глоссарий";
                    break;
                case "Для старших классов":
                    sql = "SELECT COUNT(*) AS count FROM comments WHERE book_id=" + req.query.book + " AND comment_type='Аргументы'";
                    nameComment = "Аргументы";
                    break;
                case "Для студентов":
                    sql = "SELECT COUNT(*) AS count FROM comments WHERE book_id=" + req.query.book + " AND comment_type='Цитирование'";
                    nameComment = "Цитирование";
                    break;
                case "Общая литература":
                    sql = ""
                    break;
            }
            if (sql != "")
                db.query(sql, (error, rows, fields) => {
                    if (error) {
                        response.status(400, error, res)
                    } else {
                        dopComment = rows[0].count;
                        response.status(200, { pastBook, wantBook, reviews, quotes, dopComment, nameComment }, res)
                    }
                })
            else {
                dopComment = 0;
                response.status(200, { pastBook, wantBook, reviews, quotes, dopComment }, res)
            }
        }
    })
}
exports.getAllComments = (req, res) => {
    db.query("SELECT temp_bd.comment_id, temp_bd.comment_text, user_name, surname, avatar, temp_bd.date FROM (SELECT * FROM comments WHERE book_id=" + req.query.book + " AND comment_type='" + req.query.comment + "') AS temp_bd LEFT JOIN users ON temp_bd.user_id=users.user_id", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}
exports.getAllCommentsUser = (req, res) => {
    const id = req.user[0].user_id;
    db.query("SELECT temp_bd.comment_id, temp_bd.comment_text, book_name, author, user_name, surname, avatar, temp_bd.date FROM (SELECT * FROM comments WHERE user_id=" + id + " AND comment_type='" + req.query.comment + "') AS temp_bd LEFT JOIN users ON temp_bd.user_id=users.user_id LEFT JOIN books ON temp_bd.book_id=books.book_id", (error, rows, fields) => {
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
    db.query("SELECT * FROM diary_reader WHERE book_id=" + req.query.book + " AND user_id=" + id, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            if (typeof rows !== 'undefined' && rows.length > 0)
                db.query("UPDATE diary_reader SET type_book='" + req.body.sectionDiary + "' WHERE user_id=" + id + " AND book_id=" + req.query.book + "", (error, results) => {
                    if (error) {
                        response.status(400, error, res)
                    } else {
                        response.status(200, req.body.sectionDiary, res)
                    }
                })
            else
                db.query("INSERT INTO `diary_reader`(`user_id`, `book_id`, `type_book`) VALUES('" + id + "', '" + req.query.book + "', '" + req.body.sectionDiary + "')", (error, rows, fields) => {
                    if (error) {
                        response.status(400, error, res)
                    } else {
                        response.status(200, req.body.sectionDiary, res)
                    }
                })
        }
    })
}
exports.getAllBooks = (req, res) => {
    const count = req.query.count;
    const page = req.query.page;
    const isSorted = req.query.isSorted;
    const fieldSort = req.query.fieldSort;
    const typeBook = req.query.typeBook;
    const beginTakeBook = (parseInt(page) - 1) * parseInt(count);
    let totalCount = 0; //количество записей в базе данных

    // console.log(typeBook)

    const partSqlSorted = isSorted === "true" ? " ORDER BY " + fieldSort + " DESC " : "";
    const partSqlEducational = typeBook != "undefined" ? " WHERE type_book='" + typeBook + "' " : "";

    const sql = "SELECT book_id, book_name, author, book_description, illustration_cover, year_publication FROM books " + partSqlEducational + partSqlSorted + " LIMIT " + beginTakeBook + ", " + count + "";
    console.log(sql)
    // if (isSorted === "true")
    //     sql = "SELECT book_id, book_name, author, book_description, illustration_cover, year_publication FROM books ORDER BY " + fieldSort + " DESC LIMIT " + beginTakeBook + ", " + count + "";
    // else
    //     sql = "SELECT book_id, book_name, author, book_description, illustration_cover, year_publication FROM books LIMIT " + beginTakeBook + ", " + count + "";
    db.query("SELECT COUNT(*) AS totalCount FROM books " + partSqlEducational + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            totalCount = rows[0].totalCount;
        }
    })
    db.query(sql, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            let books = rows;
            response.status(200, { books, totalCount }, res)
        }
    })
}
exports.foundBooks = (req, res) => {
    const count = req.query.count;
    const page = req.query.page;
    const isSorted = req.query.isSorted;
    const fieldSort = req.query.fieldSort;
    const typeBook = req.query.typeBook;
    const beginTakeBook = (parseInt(page) - 1) * parseInt(count);

    const partSqlSorted = isSorted === "true" ? " ORDER BY " + fieldSort + " DESC " : "";
    const partSqlEducational = typeBook != "undefined" ? " WHERE type_book='" + typeBook + "' " : "";

    const getConversionSqlCount = (searchField, fieldFind) => ("SELECT COUNT(*) AS totalCount FROM (SELECT *, LOCATE('" + searchField + "', " + fieldFind + ") as pos FROM books " + partSqlEducational + ") AS temp_table WHERE temp_table.pos>0 ")
    const getConversionSqlFind = (searchField, fieldFind) => {
        return ("SELECT book_id, book_name, author, book_description, illustration_cover, year_publication FROM (SELECT *, LOCATE('" + searchField + "', " + fieldFind + ") as pos FROM books " + partSqlEducational + ") AS temp_table WHERE temp_table.pos>0 " + partSqlSorted + " LIMIT " + beginTakeBook + ", " + count + "")
        // if (fieldSort)
        //     return ("SELECT book_id, book_name, author, book_description, illustration_cover, year_publication FROM (SELECT *, LOCATE('" + searchField + "', " + fieldFind + ") as pos FROM books) AS temp_table WHERE temp_table.pos>0 ORDER BY " + fieldSort + " DESC LIMIT " + beginTakeBook + ", " + count + "")
        // else
        //     return ("SELECT book_id, book_name, author, book_description, illustration_cover, year_publication FROM (SELECT *, LOCATE('" + searchField + "', " + fieldFind + ") as pos FROM books) AS temp_table WHERE temp_table.pos>0 LIMIT " + beginTakeBook + ", " + count + "")
    }

    let totalCount = 0; //количество записей в базе данных
    let books = null; //найденные записи
    db.query(getConversionSqlCount(req.query.searchField, req.query.fieldFind), (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            totalCount = rows[0].totalCount;
        }
    })
    db.query(getConversionSqlFind(req.query.searchField, req.query.fieldFind), (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            books = rows;
            response.status(200, { books, totalCount }, res)
        }
    })
    // if (BooksFoundName.length < 3)
    //     db.query(sql, 'author', (error, rows, fields) => {
    //         if (error) {
    //             response.status(400, error, res)
    //         } else {
    //             BooksFoundAuthor = rows;
    //         }
    //     })
    // else
    //     response.status(200, { BooksFoundName, totalCount }, res)
    // if (BooksFoundAuthor.length < 3)
    //     db.query(sql, 'book_description', (error, rows, fields) => {
    //         if (error) {
    //             response.status(400, error, res)
    //         } else {
    //             BooksFoundDescription = rows;
    //             response.status(200, { BooksFoundName, BooksFoundAuthor, BooksFoundDescription, totalCount }, res)
    //         }
    //     })
    // else
    //     response.status(200, { BooksFoundName, BooksFoundAuthor, totalCount }, res)
}

exports.getBooksDiaryReader = (req, res) => {
    const id = req.user[0].user_id;
    db.query("SELECT b.book_id, b.book_name, b.author, b.illustration_cover FROM (SELECT * FROM diary_reader dr WHERE dr.user_id=" + id + " AND dr.type_book='" + req.query.typeDiary + "') AS temp_table LEFT JOIN books b ON temp_table.book_id = b.book_id", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            let books = rows;
            let totalCount = books.length;
            response.status(200, { books, totalCount }, res)
        }
    })
}

exports.setBooksDiaryReader = (req, res) => {
    const id = req.user[0].user_id;
    console.log(req.query.typeDiary)
    db.query("UPDATE diary_reader SET type_book='" + req.body.typeDiary + "' WHERE user_id=" + id + " AND book_id=" + req.query.book + "", (error, results) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, results, res)
        }
    })
}

exports.setRating = (req, res) => {
    const id = req.user[0].user_id;

    //Ассинхронная функция полученияданных с БД
    let getRatingBook = (res, book) => {
        return new Promise(resolve => {
            db.query("SELECT rating, count_rating FROM books WHERE book_id=" + book + "", (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    resolve(rows)
                }
            })
        });
    }

    //Обновляем данные нового рейтинга
    const setRatingBook = (res, book, rating, count) => {
        db.query("UPDATE books SET rating=" + rating + ", count_rating=" + count + " WHERE book_id=" + book + "", (error, rows, fields) => {
            if (error) {
                response.status(400, error, res)
            } else {
                return rows;
            }
        })
    }

    //Проверка на существование оценки от данного пользователя
    db.query("SELECT * FROM users_rating WHERE user_id=" + id + " AND book_id=" + req.query.book + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else if (typeof rows !== 'undefined' && rows.length > 0) {
            const currentRatingUser = rows[0].rating;
            db.query("UPDATE users_rating SET rating='" + req.body.rating + "' WHERE user_id=" + id + " AND book_id=" + req.query.book + "", async (error, results) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    const dataRatingBook = await getRatingBook(res, req.query.book); //получаем данные с таблицы книги о текущем рейтинге
                    const newRating = (parseInt(dataRatingBook[0].rating) + parseInt(req.body.rating) - parseInt(currentRatingUser)) / parseInt(dataRatingBook[0].count_rating);
                    setRatingBook(res, req.query.book, newRating, dataRatingBook[0].count_rating)
                    response.status(200, newRating, res)
                }
            })
        } else {
            db.query("INSERT INTO `users_rating`(`user_id`, `book_id`, `rating`) VALUES('" + id + "', '" + req.query.book + "', '" + req.body.rating + "')", async (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    const dataRatingBook = await getRatingBook(res, req.query.book); //получаем данные с таблицы книги о текущем рейтинге
                    const newRating = (parseInt(dataRatingBook[0].rating) + parseInt(req.body.rating)) / (parseInt(dataRatingBook[0].count_rating) + 1);
                    setRatingBook(res, req.query.book, newRating, parseInt(dataRatingBook[0].count_rating) + 1)
                    response.status(200, newRating, res)
                }
            })
        }
    })
}

exports.getMyRating = (req, res) => {
    const id = req.user[0].user_id;
    let rating = 0;
    console.log(req.query.book)
    db.query("SELECT rating FROM users_rating WHERE user_id=" + id + " AND book_id=" + req.query.book + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else if (typeof rows !== 'undefined' && rows.length > 0) {
            rating = rows[0].rating;
            response.status(200, rating, res)
        } else {
            response.status(200, rating, res)
        }
    })
}

exports.getLastQuotes = (req, res) => {
    db.query("SELECT books.book_id, book_name, author, illustration_cover, temp_table.comment_id, temp_table.comment_text FROM (SELECT DISTINCT book_id, comment_id, comment_type, comment_text, date, user_id FROM comments WHERE comment_type='Цитаты' ORDER BY comment_id DESC LIMIT 0, 10) AS temp_table LEFT JOIN books ON books.book_id=temp_table.book_id", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}

exports.checkInDiaryReader = (req, res) => {
    const id = req.user[0].user_id;
    db.query("SELECT type_book FROM diary_reader WHERE book_id=" + req.query.bookId + " AND user_id=" + id, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows[0], res)
        }
    })
}