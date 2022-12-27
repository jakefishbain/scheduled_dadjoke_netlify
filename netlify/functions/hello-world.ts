import fetch from 'node-fetch';

export const handler = async () => {
  const joke = await fetch('https://icanhazdadjoke.com/', {
    headers: {
        Accept: 'text/plain',
    },
  }).then((res) => res.text());

  console.log('JOKE: ', joke)

  return {
    statusCode: 200,
    body: JSON.stringify(joke, null, 2)
    // body: 'waddup chat?',
  };
};