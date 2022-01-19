'use strict'

//Ответы сервера

//exports - экспортирует функцию
exports.status = (status, values, res) => {

    const data = {
        "satus": status,
        "values": values
    }

    res.status(data.satus) //Установите код состояния этого ответа.
    res.json(data) //Объекты экспресс-ответа имеют функцию json(). Функция res.json() принимает единственный параметр, объект obj, сериализует его в JSON и отправляет в теле ответа HTTP.
    res.end() //Функция res.end () используется для завершения процесса ответа.

}