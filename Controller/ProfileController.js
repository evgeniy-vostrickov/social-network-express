'use strict'

const response = require('./../response')
const db = require('./../settings/db')
const moment = require('moment')
const fs = require('fs');


exports.getFriends = (req, res) => {
    const id = req.user[0].user_id;
    db.query("SELECT users.user_id, users.email, users.user_name, users.surname, users.avatar, users.direction_work_study, f.second_user_id, f.confirmation FROM (SELECT * FROM friends WHERE first_user_id=" + id + " OR second_user_id=" + id + ") AS f LEFT JOIN users ON (first_user_id=user_id AND user_id!=" + id + ") OR (second_user_id=user_id AND user_id!=" + id + ")", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
            // console.log(rows)
        }
    })
}

exports.getFollowGroups = (req, res) => {
    const id = req.user[0].user_id;
    let followGroup = null;
    db.query("SELECT gn.group_id, group_name, illustration_group, city FROM (SELECT * FROM band_members WHERE user_id=" + id + ") AS temp_table LEFT JOIN group_network gn ON temp_table.group_id = gn.group_id", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            followGroup = rows;
        }
    })
    db.query("SELECT group_id, group_name, illustration_group, city FROM group_network WHERE owner=" + id, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            followGroup = [...followGroup, ...rows];
            response.status(200, followGroup, res)
        }
    })
}

exports.setPersonalDataUser = (req, res) => {
    // console.log(req.user[0].user_id)
    const id = req.user[0].user_id;
    db.query("UPDATE users SET " + req.query.field + "='" + req.body.newData + "' WHERE user_id=" + id + "", (error, results) => {
        if (error) {
            response.status(400, error, res)
            // console.log(error)
        } else {
            response.status(200, { message: `Персональные данные успешно изменены.`, results }, res)
            // console.log(rows)
        }
    })
}

exports.saveAvatar = (req, res) => {
    const id = req.user[0].user_id;
    const formatImage = req.body.file.substring("data:image/".length, req.body.file.indexOf(";base64,"));
    const data = req.body.file.replace(/^data:image\/\w+;base64,/, "");
    const buf = Buffer.from(data, 'base64');
    const date = moment().format('DDMMYYYY-HHmmss_SSS')
    const pathAvatar = `uploads/${date}-newavataruser.${formatImage}`;
    fs.writeFile(pathAvatar, buf, (err, result) => {
        if(err) console.log('error', err);
    });
    db.query("UPDATE users SET avatar='" + pathAvatar + "' WHERE user_id=" + id + "", (error, results) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, pathAvatar, res)
        }
    })
}

exports.getDataLike = (req, res) => {
    const id = req.query.id || req.user[0].user_id;
    let likeAuthors = null;
    let likeGenres = null;
    let likeBooks = null;
    db.query("SELECT COUNT(*) AS count, author FROM diary_reader LEFT JOIN books b ON diary_reader.book_id = b.book_id WHERE user_id=" + id + " GROUP BY author ORDER BY count DESC LIMIT 3", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            likeAuthors = rows;
        }
    })
    db.query("SELECT COUNT(*) AS count, genre_name FROM diary_reader dr LEFT JOIN (SELECT b.book_id, g.genre_name FROM books b LEFT JOIN genres g ON b.genre_id = g.genre_id) AS temp_table ON temp_table.book_id=dr.book_id WHERE user_id=" + id + " GROUP BY  temp_table.genre_name ORDER BY count DESC LIMIT 3", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            likeGenres = rows;
        }
    })
    db.query("SELECT b.book_id, b.book_name, b.author, b.illustration_cover FROM (SELECT * FROM diary_reader WHERE user_id=" + id + " AND type_book='Прочитанные книги' ORDER BY book_id DESC LIMIT 3) AS temp_table LEFT JOIN books b ON b.book_id=temp_table.book_id", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            likeBooks = rows;
            response.status(200, {likeAuthors, likeGenres, likeBooks}, res)
        }
    })
}