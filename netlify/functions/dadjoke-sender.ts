import { Handler } from '@netlify/functions';
import fetch from 'node-fetch';

export const handler: Handler = async () => {
    const joke = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        Accept: 'text/plain',
      },
    }).then((res) => res.text());
  
    console.log('JOKE: ', joke)
    // const response = await notion.pages.create({
    //   parent: { database_id: dbId },
    //   properties: {
    //     Name: {
    //       title: [
    //         {
    //           text: {
    //             content: joke,
    //           },
    //         },
    //       ],
    //     },
    //   },
    // });
  
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(joke, null, 2),
    };
  };