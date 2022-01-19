'use strict'

const response = require('./../response')
const db = require('./../settings/db')
// const io = require('../server')

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
    db.query("SELECT dialog_id FROM users_dialogs WHERE user_id=" + req.user[0].user_id + "", (error, rows, fields) => {
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
        db.query("INSERT INTO `messages`(`dialog_id`, `message_id`, `user_id`, `text_message`) VALUES('" + req.body.dialogId + "', '" + req.body.numLastMessage + "', '" + req.body.userId + "', '" + textMessage + "')", (error, results) => {
            if (error) {
                response.status(400, error, res)
                // console.log(error)
            } else {
                response.status(200, textMessage, res)
                io.emit('SERVER:NEW_MESSAGE', { textMessage });
            }
        })
    }
}

exports.getAllMessages = (req, res) => {
    db.query("SELECT user_id, text_message FROM messages WHERE dialog_id=" + req.query.dialog + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
            // console.log(error)
        } else {
            const messages = rows;
            db.query("SELECT user_id FROM users_dialogs WHERE dialog_id=" + req.query.dialog + "", (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                    // console.log(error)
                } else {
                    const answer2 = rows;
                    response.status(200, {messages, userId: answer2[0].user_id}, res)
                }
            })
        }
    })
}