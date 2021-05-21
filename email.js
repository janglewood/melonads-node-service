const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const { headersSettingsMidleware } = require('./midlewares');

const app = express();
app.use(
  express.urlencoded({ extended: true }),
  express.json(),
  headersSettingsMidleware
);

const contactAddress = 'test@api.wantbox.by';
const transport = {
  // sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail',
  host: 'api.wantbox.by',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // if on local
  },
};

const mailer = nodemailer.createTransport(transport);
app.post('/order', cors(), (req, res) => {
  const { name, message, phoneNumber, subject, email } = req.body;
  mailer.sendMail(
    {
      from: email,
      to: [contactAddress],
      subject: subject || '[No subject]',
      html:
        `<div><h1>Привет, ${name}! Это твой номер - ${phoneNumber}?</h1><span style="color: red">${message} ---Env Var ${process.env.MAIL_USER}</span></div>` ||
        '[No message]',
    },
    function (err, info) {
      if (err) {
        return res.status(500).send(err);
      }
      res.json({ success: true, info });
    }
  );
});
app.listen(3003);
