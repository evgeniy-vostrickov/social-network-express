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
    const data = req.body.file.replace(/^data:image\/\w+;base64,/, "");
    const buf = Buffer.from(data, 'base64');
    const date = moment().format('DDMMYYYY-HHmmss_SSS')
    const pathAvatar = `uploads/${date}-newavatar.png`;
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

// exports.saveAvatar = (req, res) => {
//     const id = req.user[0].user_id;
//     // Меняем двойной обратный слэш на одинарный обычный в пути к файлу, что бы можно было записать в бд и считать в нормальной форме
//     req.file.path = req.file.path.replace("\\","/")
//     db.query("UPDATE users SET avatar='" + req.file.path + "' WHERE user_id=" + id + "", (error, results) => {
//         if (error) {
//             response.status(400, error, res)
//         } else {
//             response.status(200, req.file.path, res)
//         }
//     })
// }

// exports.messenger = (socket) => {
//     socket.on('chat message', (msg) => {
//         console.log('message: ' + msg);
//     });
// };