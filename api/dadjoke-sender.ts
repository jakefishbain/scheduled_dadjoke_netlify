import nodemailer from 'nodemailer';
import emails from '../emails.json';

const JOKE_ENDPOINT = 'https://icanhazdadjoke.com/';

async function getDadJoke(): Promise<string> {
  const response = await fetch(JOKE_ENDPOINT, {
    headers: {
      Accept: 'text/plain',
      'User-Agent': 'dadjoke-mailer (vercel-cron)'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch joke (${response.status} ${response.statusText})`);
  }

  return response.text();
}

function createTransporter() {
  if (!process.env.USERNAME || !process.env.PASSWORD) {
    throw new Error('Missing USERNAME or PASSWORD env vars for SMTP authentication.');
  }

  return nodemailer.createTransport({
    host: 'smtp.zoho.com',
    secure: true,
    port: 465,
    auth: {
      user: process.env.USERNAME,
      pass: process.env.PASSWORD
    }
  });
}

export default async function handler(req: any, res: any) {
  try {
    if (process.env.CRON_SECRET) {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const joke = await getDadJoke();

    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.USERNAME,
      bcc: emails,
      subject: 'Dad Joke of the Day 👴🏼',
      text: `${joke}\n\n🐟`
    });

    return res.status(200).json({ sent: true, recipients: emails.length, joke });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to send dad joke email:', error);
    return res.status(500).json({ sent: false, error: message });
  }
}
