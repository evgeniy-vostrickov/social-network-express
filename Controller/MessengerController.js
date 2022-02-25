'use strict'

const response = require('./../response')
const db = require('./../settings/db')

exports.addNewDialog = (io) => {
    return (req, res) => {
        const id = req.user[0].user_id;
        const user_id = req.body.user_id;
        const textMessage = req.body.message;
        const timestamp = req.body.timestamp;
        db.query("SELECT * FROM users_dialogs ud WHERE (first_user_id=" + id + " AND ud.second_user_id=" + user_id + ") OR (ud.first_user_id=" + user_id + " AND ud.second_user_id=" + id + ")", (error, rows, fields) => {
            if (error) {
                response.status(400, error, res)
            } else if (typeof rows !== 'undefined' && rows.length > 0) {
                response.status(302, {dialogExists: "Диалог с данным пользователем уже существует, перейдите в сообщения!"}, res)
            } else {
                db.query("INSERT INTO `users_dialogs`(`first_user_id`, `second_user_id`) VALUES('" + id + "', '" + user_id + "')", (error, results) => {
                    if (error) {
                        response.status(400, error, res)
                    } else {
                        const dialogId = results.insertId;
                        db.query("INSERT INTO `messages`(`dialog_id`, `message_id`, `user_id`, `text_message`, `timestamp`) VALUES('" + dialogId + "', '" + 0 + "', '" + id + "', '" + textMessage + "', '" + timestamp + "')", (error, results) => {
                            if (error) {
                                response.status(400, error, res)
                                // console.log(error)
                            } else {
                                io.sockets.in(user_id).emit('CLIENT:NEW_MESSAGE', { dialogId, message: {author: id, message_id: 0, text_message: textMessage, timestamp} });
                                io.sockets.in(id).emit('CLIENT:NEW_MESSAGE', { dialogId, message: {author: id, message_id: 0, text_message: textMessage, timestamp} });
                                response.status(200, { author: id, message_id: 0, text_message: textMessage, timestamp: timestamp }, res)
                            }
                        })
                    }
                })
            }
        })
    }
}

exports.getAllDialogs = (req, res) => {
    const id = req.user[0].user_id;
    //SELECT text_message FROM messages WHERE dialog_id=25 ORDER BY message_id DESC LIMIT 1
    db.query("SELECT dialog_id, user_id, users.user_name as name, users.surname, users.status, users.avatar FROM (SELECT users_dialogs.first_user_id, users_dialogs.second_user_id, dialog_id FROM users_dialogs WHERE first_user_id=" + id + " OR second_user_id=" + id + ") AS f LEFT JOIN users ON (first_user_id=user_id AND user_id!=" + id + ") OR (second_user_id=user_id AND user_id!=" + id + ")", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
            // console.log(error)
        } else {
            response.status(200, rows, res)
        }
    })
}

exports.sendNewMessage = (io) => {
    return (req, res) => {
        //Запись в БД нового сообщения
        const textMessage = req.body.message;
        const dialogId = req.body.dialogId;
        const numMessage = req.body.numLastMessage;
        const userIdRecipient = req.body.userIdRecipient;
        const timestamp = req.body.timestamp;
        const id = req.user[0].user_id;
        db.query("INSERT INTO `messages`(`dialog_id`, `message_id`, `user_id`, `text_message`, `timestamp`) VALUES('" + dialogId + "', '" + numMessage + "', '" + id + "', '" + textMessage + "', '" + timestamp + "')", (error, results) => {
            if (error) {
                response.status(400, error, res)
                // console.log(error)
            } else {
                io.sockets.in(userIdRecipient).emit('CLIENT:NEW_MESSAGE', { dialogId, message: {author: id, message_id: numMessage, text_message: textMessage, timestamp} });
                io.sockets.in(id).emit('CLIENT:NEW_MESSAGE', { dialogId, message: {author: id, message_id: numMessage, text_message: textMessage, timestamp} });
                response.status(200, { author: id, message_id: numMessage, text_message: textMessage, timestamp: timestamp }, res)
            }
        })
    }
}

exports.getAllMessages = (req, res) => {
    db.query("SELECT user_id as author, message_id, text_message, timestamp FROM messages WHERE dialog_id=" + req.query.dialog + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
            // console.log(error)
        } else {
            response.status(200, rows, res)
            // const messages = rows;
            // db.query("SELECT first_user_id FROM users_dialogs WHERE dialog_id=" + req.query.dialog + "", (error, rows, fields) => {
            //     if (error) {
            //         response.status(400, error, res)
            //         // console.log(error)
            //     } else {
            //         const answer2 = rows;
            //         response.status(200, {messages, userId: answer2[0].user_id}, res)
            //     }
            // })
        }
    })
}