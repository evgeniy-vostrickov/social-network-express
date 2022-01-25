'use strict'

const response = require('./../response')
const db = require('./../settings/db')

exports.addNewDialog = (io) => {
    return (req, res) => {
        //В БД создаем новый диалог
        //!!!Нужно создать диалог для двух пользователей
        //!Нужна проверка на существование диалога
        const id = req.user[0].user_id;
        // db.query("SELECT user_id, dialog_id FROM users_dialogs WHERE user_id=" + id + "", (error, rows, fields) => {
        //     if (error) {
        //         response.status(400, error, res)
        //     } else if (typeof rows !== 'undefined' && rows.length > 0) {
        //         console.log(rows)
        //         const row = JSON.parse(JSON.stringify(rows))
        //         row.map(rw => {
        //             response.status(302, { message: `Диалог с таким пользователем уже существует!` }, res)
        //             return true
        //         })
        //     } 
        // })

        db.query("INSERT INTO `users_dialogs`(`user_id`) VALUES('" + id + "')", (error, results) => {
            if (error) {
                response.status(400, error, res)
                // console.log(error)
            } else {
                // response.status(200, rows, res)
                // console.log(results.insertId)
                const textMessage = req.body.message;
                db.query("INSERT INTO `messages`(`dialog_id`, `message_id`, `user_id`, `text_message`) VALUES('" + results.insertId + "', '" + 0 + "', '" + req.body.user_id + "', '" + textMessage + "')", (error, results) => {
                    if (error) {
                        response.status(400, error, res)
                        // console.log(error)
                    } else {
                        response.status(200, textMessage, res)
                        io.emit('SERVER:DIALOG_CREATED', { textMessage });
                    }
                })
            }
        })
    }
}

exports.getAllDialogs = (req, res) => {
    const id = req.user[0].user_id;
    //SELECT text_message FROM messages WHERE dialog_id=25 ORDER BY message_id DESC LIMIT 1
    db.query("SELECT dialog_id, users.user_name as name, users.surname, users.avatar FROM (SELECT users_dialogs.first_user_id, users_dialogs.second_user_id, dialog_id FROM users_dialogs WHERE first_user_id=" + id + " OR second_user_id=" + id + ") AS f LEFT JOIN users ON (first_user_id=user_id AND user_id!=" + id + ") OR (second_user_id=user_id AND user_id!=" + id + ")", (error, rows, fields) => {
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
        const timestamp = req.body.timestamp;
        const id = req.user[0].user_id;
        db.query("INSERT INTO `messages`(`dialog_id`, `message_id`, `user_id`, `text_message`, `timestamp`) VALUES('" + dialogId + "', '" + numMessage + "', '" + id + "', '" + textMessage + "', '" + timestamp + "')", (error, results) => {
            if (error) {
                response.status(400, error, res)
                // console.log(error)
            } else {
                io.sockets.in(dialogId).emit('CLIENT:NEW_MESSAGE', { dialogId, message: {author: id, message_id: numMessage, text_message: textMessage, timestamp} });
                // io.emit('SERVER:NEW_MESSAGE', { dialogId, message: {author: id, message_id: numMessage, text_message: textMessage, timestamp} })
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