// Node Modules
const cookieSession = require('cookie-session')
const LocalStrategy = require('passport-local')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const passport = require('passport')
const express = require('express')
const next = require('next')
const cors = require('cors')
const keys = require('./config/keys')

// Models
const Settings = require('./models/settings')
const Post = require('./models/post')
const User = require('./models/user')
const Comment = require('./models/comment')

// Classes
const ContactRoutes = require('./classes/contactRoutes')
const PaymentRoutes = require('./classes/paymentRoutes')
const AdminRoutes = require('./classes/adminRoutes')
const AuthRoutes = require('./classes/authRoutes')
const PostRoutes = require('./classes/postRoutes')
const BlogRoutes = require('./classes/blogRoutes')
const StoreRoutes = require('./classes/storeRoutes')

// Server config
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const server = express()

// Mongo config
mongoose.connect(keys.mongoURI, { useNewUrlParser: true })
mongoose.set('useFindAndModify', false)
mongoose.Promise = global.Promise

// CORS
server.use(cors({
  methods:['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

// Middleware helpers
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(cookieSession({
  maxAge: 30 * 24 * 60 * 60 * 1000,
  keys: [keys.cookieKey]
}))

// Passport config
server.use(passport.initialize())
server.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Configure app settings
let appSettings

// Set user and settings to res.locals
server.use((req, res, done) => {

  // Search for a settings document
  Settings.find().exec((error, settings) => {

    if (error) {
      console.error(error)
    }

    // We only EVER want ONE settings document
    // If no document exists, create one and rerun function
    if (settings.length === 0) {
      appSettings = new Settings()
      appSettings.save()
      console.log('New settings document created')

      // Give mongo time to save the document 
      // before running the funciton again
      // to prevent creating a duplicate settings document
      setTimeout(() => { }, 3000)
    } else {
      appSettings = settings[0]
    }

    res.locals.settings = appSettings
    res.locals.currentUser = req.user

    done()
  }) // End callback
}) // End middleware

app.prepare().then(() => {

  // Root Route
  server.get('/', async (req, res) => {
    res.redirect('/blog')
  })

  server.post('/api/googleAnalyticsId', (req, res) => {
    if (keys.rootURL.includes(req.get('host'))) {
      res.send(keys.googleAnalyticsId)
    } else {
      res.send('nunya beezwax')
    }
  })

  // Register Routes
  new AdminRoutes(server, app)
  new AuthRoutes(server, app)
  new PostRoutes(server, app)
  // new ContactRoutes(server, app)
  // new PaymentRoutes(server, app)
  new BlogRoutes(server, app)
  // new StoreRoutes( server, app )

  // Anything without a specified route
  server.get('*', (req, res) => {
    return handle(req, res)
  })

  server.listen(keys.port, (err) => {
    if (err) {
      throw err
    }
    console.log(`> Ready on ${keys.rootURL}`)
  })
}).catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})

// DB migration
const migratePosts = async () => {

  // Get the admin user
  const ceanne = await User.findOne({ email: 'cmaxey02@gmail.com' })

  const posts = await Post.find()
  posts.forEach(async (post, i) => {
    const doc = post._doc

    if (!doc.content) {
      const newDoc = {
        type: 'blog',
        title: doc.title,
        content: doc.body,
        tags: [doc.category],
        mainMedia: doc.image,
        subImages: [],
        comments: doc.comments,
        published: true,
        author: ceanne
      }

      await Post.findByIdAndUpdate(doc._id, newDoc)
    }
  })
}

const migrateUsers = async () => {

  const users = await User.find()
  users.forEach(async (post, i) => {
    const doc = post._doc

    if (!doc.firstName) {

      const { isAdmin, isSubscribed, created, _id, email, username } = doc
      const newDoc = {
        isAdmin: isAdmin,
        username: email,
        firstName: username,
        lastName: '',
        isSubscribed: isSubscribed,
        created: created,
      }

      await User.findOneAndUpdate({ _id }, newDoc)
    }
  })
}

const migrateComments = async () => {

  const comments = await Comment.find()

  comments.forEach(async (post, i) => {
    const doc = post._doc

    if (!doc.content) {

      const { text, replies, created, author, _id } = doc

      const newDoc = {
        content: text,
        replies: replies,
        created: created,
        author: author.id
      }

      await Comment.findByIdAndUpdate(_id, newDoc)
    }
  })
}

migrateUsers()
migrateComments()
migratePosts()
