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
      },
    });

    // console.log('username: ', process.env.USERNAME)
    // console.log('password: ', process.env.PASSWORD)

    // const response = await transporter.sendMail({text: joke + '\n\n🐟', ...mailOptions}, function(error, info){
    //   console.log('in transporter.sendMail')
    //   if (error) {
    //     console.log('ERROR!!! ', error);
    //   } else {
    //     console.log('Email sent: ' + info.response);
    //   }
    // });
    return new Promise(
      (resolve, reject) => {
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  console.error(`couldn't send mail ${error}`);
                  reject(error)
              } else {
                  console.log('Message sent: ' + info.response);
                  resolve(info.response)
              }
          });

      })

  
    // return {
    //   statusCode: 200,
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(joke, null, 2),
    // };
  };