# Kore.ai JWT Service for Vercel

This is the server-side JWT generation service for the React Web SDK app.

Kore.ai Web SDK calls:

```text
POST /api/users/sts
```

The function reads the user's `identity`, signs a JWT using the Kore.ai Client Secret stored in Vercel environment variables, and returns:

```json
{
  "jwt": "..."
}
```

## Local test

```bash
npm install
```

Set environment variables:

```text
CLIENT_ID=your-kore-client-id
CLIENT_SECRET=your-kore-client-secret
```

For local Vercel development, install Vercel CLI and run:

```bash
vercel dev
```

The endpoint will be available at:

```text
http://localhost:3000/api/users/sts
```

## Deploy to Vercel

From this `jwt-service` folder:

```bash
npm install
npx vercel
```

Or import the folder as a Vercel project.

Add these Environment Variables in the Vercel project:

```text
CLIENT_ID
CLIENT_SECRET
```

After deployment, your JWT URL will be:

```text
https://YOUR-PROJECT.vercel.app/api/users/sts
```

Put that URL into the React app as:

```text
VITE_KORE_JWT_URL=https://YOUR-PROJECT.vercel.app/api/users/sts
```

## Kore.ai configuration

In Kore.ai:

1. Configure the Web/Mobile Client channel.
2. Create/select a Client JWT App.
3. Select `HS256`.
4. Copy the Client ID and Client Secret.
5. Keep the Client Secret only in the Vercel JWT service.
6. Ensure the bot is published/deployed as required by your Kore.ai environment.

## Security

Never put `CLIENT_SECRET` in the React project or any `VITE_*` variable.
