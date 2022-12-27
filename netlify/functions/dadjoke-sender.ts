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
      to: emails,
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

    return new Promise((resolve,reject) => {     
      let resp = false;
     
      transporter.sendMail(mailOptions, function(error, info){
         if (error) {
             console.log("error is "+error);
            reject(error); // or use rejcet(false) but then you will have to handle errors
         } 
        else {
            console.log('Email sent: ' + info.response);
            resolve(info.respinse);
         }
      },
      {
        statusCode: 200,
        body: joke
      });
    })

    // return await transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //       console.error(`couldn't send mail ${error}`);
    //       // reject(error)
    //   } else {
    //       console.log('Message sent: ' + info.response);
    //       // resolve(info.response)
    //   }
    // },
    // {
    //   statusCode: 200,
    //   // body: joke
    // }
    // );
};