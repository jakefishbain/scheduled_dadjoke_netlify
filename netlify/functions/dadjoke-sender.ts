import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';
import emails from '../../emails.json'
  
export const handler: Handler = async () => {
    const joke = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        Accept: 'text/plain',
      },
    }).then((res) => res.text());
  
    console.log('JOKE: ', joke)

    const mailOptions = {
      from: 'jake@jakefishbain.com',
      // bcc: 'jakefishbain@gmail.com',
      to: emails,
      // to: 'jakefishbain@gmail.com',
      subject: 'Dad Joke of the Day 👴🏼',
      text: joke + '\n\n🐟'
    };

    const transporter = nodemailer.createTransport({
      host: "smtppro.zoho.com",
      secure: true,
      port: 465,
      auth: {
        user: process.env.USERNAME,
        pass: process.env.PASSWORD
      }
    });


    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.error(`couldn't send mail ${error}`);
          // reject(error)
      } else {
          console.log('Message sent: ' + info.response);
          // resolve(info.response)
      }
    });

    return {
      statusCode: 200,
      // body: joke
    }
  };