# Scheduled Dad Joke Emailer (Vercel)

This project now runs as a Vercel cron-triggered serverless function.

## What changed from Netlify

- Netlify functions were replaced with a Vercel API route at `api/dadjoke-sender.ts`.
- The schedule moved from `netlify.toml` to `vercel.json` cron config.
- The function fetches a joke from `https://icanhazdadjoke.com/` and emails it to the addresses in `emails.json`.

## Required environment variables

Set these in your Vercel project settings:

- `USERNAME` - SMTP username / sender email (Zoho)
- `PASSWORD` - SMTP password or app password
- `CRON_SECRET` - shared secret used by Vercel Cron (recommended)

Where to get them:

- `USERNAME`
  - Use the full email address of the mailbox sending the joke (for example `yourname@yourdomain.com`).
  - In Zoho Mail this is usually the same login/email identity you use for SMTP.
- `PASSWORD`
  - Prefer a Zoho **App Password** instead of your normal mailbox password.
  - Generate it in your Zoho account security settings (Search: **Zoho Mail app password**).
  - If App Passwords are unavailable on your plan, use the SMTP password for that mailbox.
- `CRON_SECRET`
  - You create this yourself (it is not issued by Zoho).
  - Generate a long random value (at least 32 characters), e.g. from `openssl rand -base64 32`.
  - Add this same value in Vercel as `CRON_SECRET` and keep it private.

Optional timezone controls:

- `SEND_TIMEZONE` - IANA timezone like `America/New_York`
- `SEND_HOUR_LOCAL` - local hour (0-23) when mail is allowed to send in that timezone

## Local development

```bash
npm install
npm run dev
```

Then call:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/dadjoke-sender
```

## Deploying to Vercel

1. Import this repo into Vercel.
2. For **Framework Preset**, choose **Other** (this repo is a cron/API project, not Next.js).
3. Add the environment variables above.
4. Deploy.
5. Verify the cron schedule in `vercel.json` (`15 13 * * *`, i.e. 13:15 UTC daily).

## Timezone considerations

Vercel cron expressions are always evaluated in UTC (not local time). If your desired send time is "every morning" in a local timezone, you have two options:

1. **Static UTC schedule (current setup):** keep one daily cron and convert your preferred local time to UTC.
2. **DST-safe local time:** run cron more frequently and use `SEND_TIMEZONE` + `SEND_HOUR_LOCAL` so the function only sends during the intended local hour.

Example for US Eastern time morning sends:

- Set `SEND_TIMEZONE=America/New_York`
- Set `SEND_HOUR_LOCAL=8`
- Configure cron to run at least hourly (requires a plan that supports hourly crons), then only the 8 AM local run sends.

## How to confirm the cron is running in Vercel

1. In the Vercel dashboard, open your project.
2. Go to the **Cron Jobs** section and confirm there is an entry for `/api/dadjoke-sender` with schedule `15 13 * * *`.
3. Open project **Logs** and filter for function path `/api/dadjoke-sender` around the scheduled time.
4. Look for a `200` response and JSON response fields like:
   - `sent: true` when email was sent
   - `sent: false, skipped: true` when timezone gating intentionally skipped
5. You can also trigger manually by calling the route with your bearer token:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-project>.vercel.app/api/dadjoke-sender
```

If this returns `{"sent":true,...}`, your SMTP/env setup is working and cron executions should do the same on schedule.
