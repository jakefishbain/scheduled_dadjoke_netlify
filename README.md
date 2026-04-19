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
