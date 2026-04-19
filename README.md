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
2. Add the environment variables above.
3. Deploy.
4. Verify the cron schedule in `vercel.json` (`15 13 * * *`, i.e. 13:15 UTC daily).
