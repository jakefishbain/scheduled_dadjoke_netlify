import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

  
export const handler: Handler = async () => {
    const joke = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        Accept: 'text/plain',
      },
    }).then((res) => res.text());
  
    console.log('JOKE: ', joke)

    const mailOptions = {
      from: 'jake@jakefishbain.com',
      bcc: 'jakefishbain@gmail.com',
      subject: 'Dad Joke of the Day 👴🏼'
    };

    const transporter = nodemailer.createTransport({
        host: "smtp.zoho.com",
        secure: true,
        port: 465,
        auth: {
          user: process.env.USERNAME,
          pass: process.env.PASSWORD
        },
      });

    transporter.sendMail({text: joke + '\n\n🐟', ...mailOptions}, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(joke, null, 2),
    };
  };