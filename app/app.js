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
require('songbird')

module.exports  = class App {
    constructor(config) {
        this.app = express()
        this.port = process.env.PORT || 8000


        let app = this.app

        // set up our express middleware
        app.use(morgan('dev')) // log every request to the console
        app.use(cookieParser('ilovethenodejs')) // read cookies (needed for auth)
        app.use(bodyParser.json()) // get information from html forms
        app.use(bodyParser.urlencoded({ extended: true }))

        app.set('views', path.join(__dirname, 'views'))
        app.set('view engine', 'ejs') // set up ejs for templating

        // required for passport
        app.use(session({
          secret: 'ilovethenodejs',
          store: new MongoStore({db: 'social-feeder'}),
          resave: true,
          saveUninitialized: true
        }))
        this.server = Server(app) //TODO: understand why server instead of app for initiailze function
        // connect to the database
        // mongoose.connect(config.database.url)
        console.log("hello")
        // configure routes
        routes(app)

        this.server = Server(app) //TODO: understand why server instead of app for initiailze function
    }

    async initialize(port) {
        await this.server.promise.listen(port)
        // Return this to allow chaining
        return this
    }
}
