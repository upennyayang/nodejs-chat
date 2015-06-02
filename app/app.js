let path = require('path')
let express = require('express')
var engine = require('ejs-locals')
let morgan = require('morgan')
let cookieParser = require('cookie-parser')
let bodyParser = require('body-parser')
let session = require('express-session')
let MongoStore = require('connect-mongo')(session)
let mongoose = require('mongoose')
let flash = require('connect-flash')
let Server = require('http').Server
let routes = require('./routes')
let io = require('socket.io')
let browserify = require('browserify-middleware')

require('songbird')

module.exports  = class App {
    constructor(config) {
        this.app = express()
        this.port = process.env.PORT || 8000

        let app = this.app

        browserify.settings({transform: ['babelify']})
        app.use('/js/index.js', browserify('./public/js/index.js'))


        // set up our express middleware
        app.use(morgan('dev')) // log every request to the console
        app.use(cookieParser('ilovethenodejs')) // read cookies (needed for auth)
        app.use(bodyParser.json()) // get information from html forms
        app.use(bodyParser.urlencoded({ extended: true }))

        app.set('views', path.join(__dirname, 'views'))
        app.set('view engine', 'ejs') // set up ejs for templating

        // Save expose your sessions to socket.io:
        this.sessionMiddleware = session({
            secret: 'ilovethenodejs',
            store: new MongoStore({
                db: 'social-chat'
            }),
            resave: true,
            saveUninitialized: true
        })

        // required for passport
        app.use(this.sessionMiddleware)

        // configure routes
        routes(this.app)

        this.server = Server(app) //TODO: understand why server instead of app for initiailze function
        this.io = io(this.server)

        this.io.use((socket, next) => {
            this.sessionMiddleware(socket.request, socket.request.res, next)
        })


        // Add some connection listeners:
        this.io.on('connection', socket => {
            console.log('a user connected')

            let username = socket.request.session.username
            socket.on('im', msg => {
                //i'm received
                console.log("[Received msg from client]", msg)
                this.io.emit('im', {username, msg})
            })
            socket.on('disconnect', () =>  console.log('user disconnected'))
        })



    }

    async initialize(port) {
        await this.server.promise.listen(port)
        // Return this to allow chaining
        return this
    }
}
