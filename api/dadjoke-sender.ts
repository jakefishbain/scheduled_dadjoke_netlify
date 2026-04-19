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
  const smtpUser = process.env.SMTP_USERNAME ?? process.env.SMTP_USER ?? process.env.USERNAME;
  const smtpPass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS ?? process.env.PASSWORD;
  const smtpHost = process.env.SMTP_HOST ?? 'smtppro.zoho.com';
  const smtpPort = Number(process.env.SMTP_PORT ?? 465);
  const smtpSecure = (process.env.SMTP_SECURE ?? 'true') === 'true';

  if (!smtpUser || !smtpPass) {
    throw new Error(
      'Missing SMTP credentials. Set SMTP_USERNAME + SMTP_PASSWORD (accepted aliases: SMTP_USER/SMTP_PASS, USERNAME/PASSWORD).'
    );
  }

  if (!Number.isFinite(smtpPort)) {
    throw new Error('SMTP_PORT must be a number.');
  }

  return nodemailer.createTransport({
    host: smtpHost,
    secure: smtpSecure,
    port: smtpPort,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });
}

function shouldSendForTimezone(now = new Date()) {
  const timezone = process.env.SEND_TIMEZONE;
  const targetHourRaw = process.env.SEND_HOUR_LOCAL;

  if (!timezone || targetHourRaw === undefined) {
    return { shouldSend: true, reason: 'Timezone gating disabled.' };
  }

  const targetHour = Number(targetHourRaw);
  if (!Number.isInteger(targetHour) || targetHour < 0 || targetHour > 23) {
    throw new Error('SEND_HOUR_LOCAL must be an integer between 0 and 23.');
  }

  const currentHourInTimezone = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      hour12: false
    }).format(now)
  );

  if (currentHourInTimezone !== targetHour) {
    return {
      shouldSend: false,
      reason: `Current hour in ${timezone} is ${currentHourInTimezone}, target is ${targetHour}.`
    };
  }

  return { shouldSend: true, reason: `Matched ${timezone} hour ${targetHour}.` };
}

export default async function handler(req: any, res: any) {
  try {
    if (process.env.CRON_SECRET) {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const timeGate = shouldSendForTimezone();
    if (!timeGate.shouldSend) {
      return res.status(200).json({
        sent: false,
        skipped: true,
        reason: timeGate.reason
      });
    }

    const joke = await getDadJoke();

    const transporter = createTransporter();
    await transporter.verify();
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USERNAME ?? process.env.USERNAME,
      bcc: emails,
      subject: 'Dad Joke of the Day 👴🏼',
      text: `${joke}\n\n🐟`
    });

    return res.status(200).json({
      sent: true,
      recipients: emails.length,
      joke,
      reason: timeGate.reason
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to send dad joke email:', error);
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'EAUTH'
    ) {
      return res.status(500).json({
        sent: false,
        error:
          'SMTP authentication failed (EAUTH/535). Use Zoho app password, verify SMTP_USERNAME, and confirm SMTP host/port.'
      });
    }

    return res.status(500).json({ sent: false, error: message });
  }
}
