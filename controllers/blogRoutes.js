const _ = require("lodash")
const Controller = require('./abstractController')
const Mailer = require('./mailer')
const BlogModel = require('../models/blog')
const UserModel = require('../models/user')
const CommentModel = require('../models/comment')
const { configureSettings } = require('../utilities/functions')
const { checkIfAdmin, sanitizeRequestBody } = require('../utilities/middleware')
const keys = require('../config/keys')

class BlogRoutes extends Controller {

  registerRoutes() {

    // Views
    this.server.get(
      '/blog', 
      this.renderPage.bind(this, '')
    )
    this.server.get(
      '/blog/all', 
      this.renderPage.bind(this, '_all')
    )
    this.server.get(
      '/blog/new', 
      checkIfAdmin, 
      this.renderPage.bind(this, '_create')
    )
    this.server.get(
      '/blog/:id', 
      this.renderPage.bind(this, '_show')
    )
    this.server.get(
      '/blog/:id/edit', 
      checkIfAdmin, 
      this.renderPage.bind(this, '_edit')
    )

    // Blog API
    this.server.post(
      '/api/blogs', 
      checkIfAdmin, 
      sanitizeRequestBody, 
      this.createBlog.bind(this)
    )
    this.server.get(
      '/api/blogs',
      checkIfAdmin,
      this.sendAllBlogs.bind(this)
    )
    this.server.get(
      '/api/published_blogs', 
      this.sendPublishedBlogs.bind(this)
    )
    this.server.get(
      '/api/blogs/:id', 
      this.sendOneBlog.bind(this)
    )
    this.server.put(
      '/api/blogs/:id', 
      checkIfAdmin, 
      sanitizeRequestBody, 
      this.updateBlog.bind(this)
    )
    this.server.delete(
      '/api/blogs/:id', 
      checkIfAdmin, 
      this.deleteBlog.bind(this)
    )

    // Due to outdated routes, reditect anything from /blogs to /blog
    this.server.get(
      '/blogs/*', 
      this.redirect.bind(this)
    )
  }


  registerSettings() {

    // Middleware to configure auth settings
    this.server.use(async (req, res, next) => {

      const defaultSettings = { enableSubscriberEmailing: false }
      const settings = await configureSettings('blog', defaultSettings)

      _.map(settings, (optionValue, optionKey) => {
        res.locals.settings[optionKey] = optionValue
      })
      next()
    })
  }


  allowUserComments(req, res, next) {

    const { settings } = res.locals

    if (settings.enableCommenting || (req.user && req.user.isAdmin)) {
      next()
    } else {
      res.status(401).send({ message: 'You are not allowed to do that' })
    }
  }


  redirect(req, res) {

    let { url } = req
    url = url.replace('blogs', 'blog')
    res.redirect(url)
  }


  renderPage(pageExtension, req, res) {

    const actualPage = `/blog${pageExtension}`
    const id = !!req.params ? req.params.id : null

    const queryParams = { id, currentUser: req.user }

    this.app.render(req, res, actualPage, queryParams)
  }


  async createBlog(req, res) {

    const blog = new BlogModel(req.body)
    blog.author = req.user

    blog.save()

    if (blog.published) {
      await this.emailSubscribers(res, blog.title, blog._id)
    }

    res.send(blog)
  }


  async emailSubscribers(res, blogTitle, blogId) {

    if (res.locals.settings.enableSubscriberEmailing) {

      const subscribedUsers = await UserModel.find({ isSubscribed: true })
      const mailer = new Mailer()
      const templatePath = 'emails/newBlog.html'
      const subject = `New Blog Post - ${blogTitle}`
      
      _.map(subscribedUsers, user => {
        
        const model = {
          firstName: user.firstName,
          blogLink: `${keys.rootURL}/blog/${blogId}`
        }
        mailer.sendEmail(model, templatePath, user.email, subject)
      })
    }
  }


  async sendAllBlogs(req, res) {

    const foundBlogs = await BlogModel.find().sort({ created: -1 })

    res.send(foundBlogs)
  }


  async sendPublishedBlogs(req, res) {

    const foundBlogs = await BlogModel.find({ published: true }).sort({ created: -1 })

    res.send(foundBlogs)
  }


  async sendOneBlog(req, res) {

    const foundBlog = await BlogModel.findById(req.params.id)
      .populate('author')
      .populate('comments')
      .populate({ path: 'comments', populate: { path: 'author' } })

    res.send(foundBlog)
  }


  async updateBlog(req, res) {

    const updatedBlog = await BlogModel.findOneAndUpdate({ _id: req.params.id }, req.body)

    if (
      !updatedBlog.published && 
      req.body.published
    ) {
      await this.emailSubscribers(res, req.body.title, req.params.id)
    }

    res.send(updatedBlog)
  }


  async deleteBlog(req, res) {

    const { id } = req.params
    const blog = await BlogModel.findById(id)

    blog.comments.forEach(async comment => {
      await CommentModel.findOneAndDelete({ _id: comment })
    })

    await BlogModel.findByIdAndDelete(id)

    res.send('blog deleted')
  }
}


module.exports = BlogRoutes
