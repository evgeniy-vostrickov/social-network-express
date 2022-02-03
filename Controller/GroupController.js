'use strict'

const response = require('./../response')
const db = require('./../settings/db')
const moment = require('moment')

exports.getFullInfoGroup = (req, res) => {
    const id = req.user[0].user_id;
    let group = null;
    db.query("SELECT group_id, group_name, group_description, city, illustration_group, owner, user_name, surname FROM (SELECT * FROM group_network WHERE group_id=" + req.query.group + ") AS temp_table LEFT JOIN users ON temp_table.owner=user_id", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            group = rows[0];
        }
    })
    db.query("SELECT COUNT(*) AS count FROM band_members WHERE group_id=" + req.query.group + " AND user_id=" + id, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            rows ? group.subscribe = true : group.subscribe = false
        }
    })
    db.query("SELECT COUNT(*) AS count FROM band_members WHERE group_id=" + req.query.group + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            group.number_participants = rows[0].count;
            response.status(200, group, res)
        }
    })
}

exports.joinGroup = (req, res) => {
    const id = req.user[0].user_id;
    db.query("INSERT INTO `band_members`(`user_id`, `group_id`) VALUES('" + id + "', '" + req.body.groupId + "')", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}

exports.leaveGroup = (req, res) => {
    const id = req.user[0].user_id;
    db.query("DELETE FROM band_members WHERE user_id=" + id + " AND group_id=" + req.body.groupId, (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}

exports.addNewEvent = (req, res) => {
    req.file.path = req.file.path.replace("\\", "/")
    db.query("INSERT INTO `group_events`(`group_id`, `event_name`, `date_publish`, `event_text`, `illustration_event`) VALUES('" + req.query.group + "', '" + req.body.event_name + "', '" + moment().format('YYYY-MM-DD') + "', '" + req.body.event_text + "', '" + req.file.path + "')", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            db.query("SELECT * FROM group_events WHERE event_id=" + rows.insertId + "", (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    response.status(200, rows, res)
                }
            })
        }
    })
}

exports.getAllEvent = (req, res) => {
    db.query("SELECT * FROM group_events WHERE group_id=" + req.query.group + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, rows, res)
        }
    })
}

exports.savePhotoGroup = (req, res) => {
    req.file.path = req.file.path.replace("\\","/")
    db.query("UPDATE group_network SET illustration_group='" + req.file.path + "' WHERE group_id=" + req.query.group + "", (error, results) => {
        if (error) {
            response.status(400, error, res)
        } else {
            response.status(200, req.file.path, res)
        }
    })
}

exports.getAllGroups = (req, res) => {
    const count = req.query.count;
    const page = req.query.page;
    const beginTakeBook = (parseInt(page) - 1) * parseInt(count);
    let totalCount = 0; //количество записей в базе данных
    db.query("SELECT COUNT(*) AS totalCount FROM group_network", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            totalCount = rows[0].totalCount;
        }
    })
    db.query("SELECT group_id, group_name, group_description, city, illustration_group FROM group_network LIMIT " + beginTakeBook + ", " + count + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            let groups = rows;
            response.status(200, { groups, totalCount }, res)
        }
    })
}

exports.foundGroups = (req, res) => {
    const count = req.query.count;
    const page = req.query.page;
    const beginTakeGroup = (parseInt(page) - 1) * parseInt(count);
    let totalCount = 0; //количество записей в базе данных
    let groups = null; //найденные записи
    db.query("SELECT COUNT(*) AS totalCount FROM (SELECT group_id, LOCATE('" + req.query.searchField + "', group_name) as pos FROM group_network) AS temp_table WHERE temp_table.pos>0", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            totalCount = rows[0].totalCount;
        }
    })
    db.query("SELECT group_id, group_name, group_description, city, illustration_group FROM (SELECT *, LOCATE('" + req.query.searchField + "', group_name) as pos FROM group_network) AS temp_table WHERE temp_table.pos>0 LIMIT " + beginTakeGroup + ", " + count + "", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            groups = rows;
            response.status(200, { groups, totalCount }, res)
        }
    })
}

exports.addNewGroup = (req, res) => {
    const id = req.user[0].user_id
    req.file.path = req.file.path.replace("\\", "/")
    let group = null
    db.query("INSERT INTO `group_network`(`owner`, `group_name`, `group_description`, `city`, `illustration_group`) VALUES('" + id + "', '" + req.body.group_name + "', '" + req.body.group_description + "', '" + req.body.city + "', '" + req.file.path + "')", (error, rows, fields) => {
        if (error) {
            response.status(400, error, res)
        } else {
            db.query("SELECT group_id, group_name, group_description, city, illustration_group, owner, user_name, surname FROM (SELECT * FROM group_network WHERE group_id=" + rows.insertId + ") AS temp_table LEFT JOIN users ON temp_table.owner=user_id", (error, rows, fields) => {
                if (error) {
                    response.status(400, error, res)
                } else {
                    group = rows[0];
                    response.status(200, group, res)
                }
            })
        }
    })
}