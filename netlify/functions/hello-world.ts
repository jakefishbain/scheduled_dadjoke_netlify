import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

import emails from '../../emails.json'

export const handler = async () => {
  const joke = await fetch('https://icanhazdadjoke.com/', {
    headers: {
        Accept: 'text/plain',
    },
  }).then((res) => res.text());

  console.log('JOKE: ', joke)

  const mailOptions = {
    from: 'jake@jakefishbain.com',
    to: emails,
    subject: 'Dad Joke of the Day 👴🏼',
    text: joke + '\n\n🐟'
  };

  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    secure: true,
    port: 465,
    auth: {
      user: process.env.USERNAME,
      pass: process.env.PASSWORD
    }
  });

  await new Promise((resolve,reject) => {     
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log("error is "+ error);
          reject(error);
        } 
      else {
          console.log('Email sent: ' + info.response);
          resolve(info.response);
        }
    });
  })

  return {
    statusCode: 200,
    body: JSON.stringify(joke, null, 2)
    // body: 'waddup chat?',
  };
};