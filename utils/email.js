const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// new Email(user,url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Ankit Sharma <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //send Grid
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    // 1
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // res.render('')
    // 2
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html),
    };

    // 3
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the Natours Family');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for 10 Min)',
    );
  }
};
