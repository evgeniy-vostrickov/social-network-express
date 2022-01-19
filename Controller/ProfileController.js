'use strict'

const response = require('./../response')
const db = require('./../settings/db')


exports.getFriends = (req, res) => {
    // console.log(req.user[0].user_id)
    const id = req.user[0].user_id;
    db.query("SELECT users.user_name, users.surname, users.direction_work_study FROM (SELECT friends.first_user_id, friends.second_user_id FROM friends friends WHERE first_user_id=" + id + " OR second_user_id=" + id + ") AS f LEFT JOIN users ON (first_user_id=user_id AND user_id!=" + id + ") OR (second_user_id=user_id AND user_id!=" + id + ")", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
            // console.log(error)
        } else {
            response.status(200, rows, res)
            // console.log(rows)
        }
    })
}

exports.getFollowGroups = (req, res) => {
    // console.log(req.user[0].user_id)
    const id = req.user[0].user_id;
    db.query("SELECT gn.group_name, gn.number_participants FROM band_members bm LEFT JOIN group_network gn ON bm.group_id = gn.group_id WHERE bm.user_id=" + id + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
            // console.log(error)
        } else {
            response.status(200, rows, res)
            // console.log(rows)
        }
    })
}

exports.setNewStatus = (req, res) => {
    // console.log(req.user[0].user_id)
    const id = req.user[0].user_id;
    db.query("UPDATE users SET status='" + req.body.status + "' WHERE user_id=" + id + "", (error, results) => {
        if (error) {
            response.status(400, error, res)
            // console.log(error)
        } else {
            response.status(200, { message: `Статус успешно изменен.`, results }, res)
            // console.log(rows)
        }
    })
}

exports.saveAvatar = (req, res) => {
    const id = req.user[0].user_id;
    response.status(200, req.file.path, res)
    // db.query("UPDATE users SET avatar='" + req.body.status + "' WHERE user_id=" + id + "", (error, results) => {
    //     if (error) {
    //         response.status(400, error, res)
    //         // console.log(error)
    //     } else {
    //         response.status(200, { message: `Статус успешно изменен.`, results }, res)
    //         // console.log(rows)
    //     }
    // })
}

// exports.messenger = (socket) => {
//     socket.on('chat message', (msg) => {
//         console.log('message: ' + msg);
//     });
// };