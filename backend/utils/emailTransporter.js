const nodemailer = require("nodemailer")

function firstEnv(...names) {
  for (const n of names) {
    if (process.env[n] && String(process.env[n]).trim() !== "") return process.env[n]
  }
  return undefined
}

// Provider-specific envs
const gmailUser = firstEnv('GMAIL_USER', 'GMAILUSER', 'Gmail_User')
const gmailPass = firstEnv('GMAIL_PASS', 'GMAILPASS', 'Gmail_Pass')
const outlookUser = firstEnv('OUTLOOK_USER', 'OUTLOOKUSER', 'Outlook_User')
const outlookPass = firstEnv('OUTLOOK_PASS', 'OUTLOOKPASS', 'Outlook_Pass')

// Generic envs (backwards compatible)
const genericUser = firstEnv('EMAIL_USER', 'Email_User', 'EMAILUSER')
const genericPass = firstEnv('EMAIL_PASS', 'Email_Pass', 'EMAILPASS')

// Decide which credentials to use (prefer provider-specific)
let emailUser = genericUser || gmailUser || outlookUser
let emailPass = genericPass || gmailPass || outlookPass

// Determine service: explicit override or infer from available vars
const explicitService = firstEnv('EMAIL_SERVICE', 'Email_Service', 'SERVICE')
let emailService = explicitService ? String(explicitService).toLowerCase() : (gmailUser ? 'gmail' : outlookUser ? 'outlook' : 'gmail')

// Build emailFrom from name/address envs
const emailFromName = firstEnv('EMAIL_FROM_NAME', 'EMAIL_FROM', 'Email_From', 'EmailFrom')
const emailFromAddress = firstEnv('EMAIL_FROM_ADDRESS', 'EMAIL_FROM_ADDRESS', 'EmailFromAddress') || emailUser
const emailFrom = (emailFromName ? `${emailFromName} <${emailFromAddress}>` : (emailFromAddress || emailUser))

if (!emailUser || !emailPass) {
  console.warn('Email transporter: missing email credentials. Set GMAIL_USER/GMAIL_PASS or OUTLOOK_USER/OUTLOOK_PASS or EMAIL_USER/EMAIL_PASS in .env')
}

let transporterConfig = {
  auth: {
    user: emailUser,
    pass: emailPass
  }
}

if (emailService === "gmail") {
  transporterConfig.service = "gmail"
} else if (emailService === "outlook" || emailService === "hotmail" || emailService === "office365") {
  transporterConfig.host = "smtp.office365.com"
  transporterConfig.port = 587
  transporterConfig.secure = false
  transporterConfig.tls = {
    ciphers: "SSLv3"
  }
} else {
  transporterConfig.host = process.env.SMTP_HOST
  transporterConfig.port = Number(process.env.SMTP_PORT) || 587
  transporterConfig.secure = process.env.SMTP_SECURE === "true"
}

const transporter = nodemailer.createTransport(transporterConfig)

// Quick verification at startup to surface auth problems early
transporter.verify((err, success) => {
  if (err) {
    console.warn('Email transporter verification failed:', err && err.message ? err.message : err)
    console.warn('Hints:')
    console.warn('- For Gmail: set GMAIL_USER and GMAIL_PASS (or EMAIL_USER/EMAIL_PASS) and use an App Password if 2FA is enabled.')
    console.warn('- For Outlook: set OUTLOOK_USER and OUTLOOK_PASS, and EMAIL_SERVICE=outlook if needed.')
    console.warn('- Available env names checked: GMAIL_*, OUTLOOK_*, EMAIL_USER/EMAIL_PASS, EMAIL_FROM_NAME, EMAIL_FROM_ADDRESS')
  } else {
    console.info('Email transporter is ready (service='+emailService+')')
  }
})

module.exports = { transporter, emailFrom }