'use strict'

module.exports = (app, io) => {
    const passport = require('passport')
    const upload = require('../middleware/upload')
    const indexController = require('./../Controller/IndexController')
    const usersController = require('./../Controller/UsersController')
    const profileController = require('./../Controller/ProfileController')
    const messengerController = require('./../Controller/MessengerController')
    const bookController = require('./../Controller/BookController')

    app.route('/auth/signup').post(usersController.signup)
    app.route('/auth/signin').post(usersController.signin)
    app.route('/auth/me').get(passport.authenticate('jwt', { session: false }), usersController.me)
    app.route('/').get(indexController.index) //Метод app.route() позволяет создавать обработчики маршрутов, образующие цепочки, для пути маршрута
    app.route('/users').get(passport.authenticate('jwt', { session: false }), usersController.getAllUsers) //передача данных по токену
    app.route('/profile/friends').get(passport.authenticate('jwt', { session: false }), profileController.getFriends)
    app.route('/profile/groups').get(passport.authenticate('jwt', { session: false }), profileController.getFollowGroups)
    app.route('/profile/status').put(passport.authenticate('jwt', { session: false }), profileController.setNewStatus)
    app.route('/profile/avatar').put(passport.authenticate('jwt', { session: false }), upload.single('image'), profileController.saveAvatar)
    app.route('/dialog/message/send').post(passport.authenticate('jwt', { session: false }), messengerController.sendNewMessage(io))
    app.route('/dialog/add').post(passport.authenticate('jwt', { session: false }), messengerController.addNewDialog(io))
    app.route('/dialog/all').get(passport.authenticate('jwt', { session: false }), messengerController.getAllDialogs)
    app.route('/dialog/message/all').get(passport.authenticate('jwt', { session: false }), messengerController.getAllMessages)
    app.route('/book/add/payload').get(passport.authenticate('jwt', { session: false }), bookController.getPayloadForAddBook)
    app.route('/book/add').post(passport.authenticate('jwt', { session: false }), upload.single('illustration_cover'), bookController.addNewBook)
    app.route('/book/info/full').get(passport.authenticate('jwt', { session: false }), bookController.getFullInfoBook)
    app.route('/book/info/additional').get(passport.authenticate('jwt', { session: false }), bookController.getAdditionalDataBook)
    app.route('/book/comments').get(passport.authenticate('jwt', { session: false }), bookController.getAllComments)
    app.route('/book/comments').post(passport.authenticate('jwt', { session: false }), bookController.addNewComment)
    app.route('/book/diary/add').post(passport.authenticate('jwt', { session: false }), bookController.addBookInDiaryReader)
    app.route('/book/all').get(passport.authenticate('jwt', { session: false }), bookController.getAllBooks)
}

