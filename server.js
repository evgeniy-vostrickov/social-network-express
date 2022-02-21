const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});
const cors = require('cors')
const port = process.env.PORT || 3500
const bodyParser = require('body-parser')
const passport = require('passport')

//настройки bodyParser
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}))
app.use(cors())
app.use('/uploads', express.static('uploads'))
app.use(bodyParser.json({limit: '50mb'}))
app.use(passport.initialize())
require('./middleware/passport')(passport)


//Наши пути/навигация
const routes = require('./settings/routes')
routes(app, io)

//Сервер слушает
server.listen(port, () => {
    console.log(`App listen on port ${port}`);
})

io.on('connection', function (socket) {
    console.log(socket.id);
    socket.on('DIALOGS:JOIN', (userId) => {
        // socket.dialogId = dialogId;
        socket.join(userId);
    });
    // socket.on('DIALOGS:TYPING', (obj) => {
    //     socket.broadcast.emit('DIALOGS:TYPING', obj);
    // });
});