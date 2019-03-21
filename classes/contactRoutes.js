const MessageModel = require('../models/message')
const Mailer = require('./mailer')
const keys = require('../config/keys')
const sanitizeHTML = require('sanitize-html')
const _ = require('lodash')

class ContactRoutes {

  constructor(server, app) {

    this.server = server
    this.app = app

    this.registerRoutes()
  }


  registerRoutes() {

    // Views
    this.server.get('/contact', this.renderPage.bind(this))

    // Message API
    this.server.post('/api/contact', this.createMessage.bind(this))
  }


  renderPage(req, res) {

    const actualPage = '/contact'

    this.app.render(req, res, actualPage)
  }


  createMessage(req, res) {

    // Santize inputs
    _.map(req.body, (input) => {
      req.body[input] = sanitizeHTML(input);
    })

    const { contactName, contactEmail, contactMessage } = req.body
    const messageObj = {
      name: contactName,
      email: contactEmail,
      message: contactMessage,
    }
    const message = new MessageModel(messageObj)

    const mailer = new Mailer()
    const templatePath = 'emails/contact.html'
    const subject = `New message from ${message.name}!`

    const sent = mailer.sendEmail(message, templatePath, keys.adminEmail, subject)

    if (sent) {
      message.emailSent = true
    }

    message.save()
    res.send(message)
  }
}


module.exports = ContactRoutes
