'use strict'

module.exports = (app, io) => {
    const passport = require('passport')
    const upload = require('../middleware/upload')
    const indexController = require('./../Controller/IndexController')
    const usersController = require('./../Controller/UsersController')
    const profileController = require('./../Controller/ProfileController')
    const messengerController = require('./../Controller/MessengerController')
    const bookController = require('./../Controller/BookController')
    const groupController = require('./../Controller/GroupController')
    const adminController = require('./../Controller/AdminController')

    app.route('/auth/signup').post(usersController.signup)
    app.route('/auth/signin').post(usersController.signin)
    app.route('/auth/me').get(passport.authenticate('jwt', { session: false }), usersController.me)
    app.route('/').get(indexController.index) //Метод app.route() позволяет создавать обработчики маршрутов, образующие цепочки, для пути маршрута
    app.route('/users').get(passport.authenticate('jwt', { session: false }), usersController.getAllUsers) //передача данных по токену
    app.route('/profile/friends').get(passport.authenticate('jwt', { session: false }), profileController.getFriends)
    app.route('/profile/groups').get(passport.authenticate('jwt', { session: false }), profileController.getFollowGroups)
    app.route('/profile/personal').put(passport.authenticate('jwt', { session: false }), profileController.setPersonalDataUser)
    app.route('/profile/avatar').put(passport.authenticate('jwt', { session: false }), profileController.saveAvatar)
    app.route('/profile/like').get(passport.authenticate('jwt', { session: false }), profileController.getDataLike)
    app.route('/dialog/message/send').post(passport.authenticate('jwt', { session: false }), messengerController.sendNewMessage(io))
    app.route('/dialog/add').post(passport.authenticate('jwt', { session: false }), messengerController.addNewDialog(io))
    app.route('/dialog/all').get(passport.authenticate('jwt', { session: false }), messengerController.getAllDialogs)
    app.route('/dialog/message/all').get(passport.authenticate('jwt', { session: false }), messengerController.getAllMessages)
    app.route('/book/add/payload').get(passport.authenticate('jwt', { session: false }), bookController.getPayloadForAddBook)
    app.route('/book/add').post(passport.authenticate('jwt', { session: false }), upload.single('illustration_cover'), bookController.addNewBook)
    app.route('/book/info/full').get(passport.authenticate('jwt', { session: false }), bookController.getFullInfoBook)
    app.route('/book/info/additional').get(passport.authenticate('jwt', { session: false }), bookController.getAdditionalDataBook)
    app.route('/book/statistics').get(passport.authenticate('jwt', { session: false }), bookController.getStatisticsBook)
    app.route('/book/comments').get(passport.authenticate('jwt', { session: false }), bookController.getAllComments)
    app.route('/book/comments/user').get(passport.authenticate('jwt', { session: false }), bookController.getAllCommentsUser)
    app.route('/book/comments').post(passport.authenticate('jwt', { session: false }), bookController.addNewComment)
    app.route('/book/diary/add').post(passport.authenticate('jwt', { session: false }), bookController.addBookInDiaryReader)
    app.route('/book/all').get(bookController.getAllBooks)
    app.route('/book/find').get(bookController.foundBooks)
    app.route('/book/diary').get(passport.authenticate('jwt', { session: false }), bookController.getBooksDiaryReader)
    app.route('/book/diary').post(passport.authenticate('jwt', { session: false }), bookController.setBooksDiaryReader)
    app.route('/book/rating').post(passport.authenticate('jwt', { session: false }), bookController.setRating)
    app.route('/book/rating').get(passport.authenticate('jwt', { session: false }), bookController.getMyRating)
    app.route('/book/quotes').get(passport.authenticate('jwt', { session: false }), bookController.getLastQuotes)
    app.route('/book/check/diary').get(passport.authenticate('jwt', { session: false }), bookController.checkInDiaryReader)
    app.route('/group/info/full').get(passport.authenticate('jwt', { session: false }), groupController.getFullInfoGroup)
    app.route('/group/subscribe').post(passport.authenticate('jwt', { session: false }), groupController.joinGroup)
    app.route('/group/unsubscribe').post(passport.authenticate('jwt', { session: false }), groupController.leaveGroup)
    app.route('/group/events').post(passport.authenticate('jwt', { session: false }), upload.single('illustration_event'), groupController.addNewEvent)
    app.route('/group/events').get(passport.authenticate('jwt', { session: false }), groupController.getAllEvent)
    app.route('/group/image').put(passport.authenticate('jwt', { session: false }), groupController.savePhotoGroup)
    app.route('/group/all').get(groupController.getAllGroups)
    app.route('/group/find').get(groupController.foundGroups)
    app.route('/group/add').post(passport.authenticate('jwt', { session: false }), upload.single('illustration_group'), groupController.addNewGroup)
    app.route('/users/all').get(passport.authenticate('jwt', { session: false }), usersController.getAllUsers)
    app.route('/users/find').get(passport.authenticate('jwt', { session: false }), usersController.foundUsers)
    app.route('/users/info').get(passport.authenticate('jwt', { session: false }), usersController.getFullInfoUser)
    app.route('/users/follow').get(passport.authenticate('jwt', { session: false }), usersController.followUser)
    app.route('/users/unfollow').get(passport.authenticate('jwt', { session: false }), usersController.unfollowUser)
    app.route('/admin/login').get(adminController.login)
    app.route('/admin/users').get(adminController.getAllUsers)
    app.route('/admin/books').get(adminController.getAllBooks)
    app.route('/admin/comments').get(adminController.getAllComments)
    app.route('/admin/comments/:commentId').get(adminController.getDataComment)
    app.route('/admin/comments/:commentId').put(adminController.updateComment)
}

