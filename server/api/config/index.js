'use strict'

const all = {
  // MongoDB connection options
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://mongo:27017/ee',
    options: {
      db: {
        safe: true
      }
    }
  },
  mail: {
    apiKey: process.env.SENDGRID_API_KEY || 'sendgrid_api_key',
    senderMail: process.env.SMTP_SENDER || 'contact@etudiant-entrepreneur.beta.gouv.fr',
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT || ''
  },

  // Secret for session
  secrets: {
    session: process.env.SESSION_SECRET || 'ssshhhhh'
  },

  sentry: {
    dsn: process.env.SENTRY_DSN || ''
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },

  userRoles: [
    'pepite',
    'admin'
  ]
}

module.exports = all
