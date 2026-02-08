# Mapbox Setup Guide

The interactive maps on mountain pages use Mapbox GL JS, which requires a free API token.

## Getting Your Mapbox Token (5 minutes)

### Step 1: Create Free Account

1. Go to https://www.mapbox.com/
2. Click **Sign Up** (top right)
3. Create account with email or GitHub
4. Verify your email

### Step 2: Get Access Token

1. After login, you'll be on the dashboard
2. Look for **Access tokens** section
3. You'll see a **Default public token** - copy this
4. Or click **Create a token** to make a new one

**Token format:** Starts with `pk.` (public key)
Example: `pk.eyJ1IjoibXl1c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ.xxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 3: Add to Environment Variables

Open your `.env.local` file and add:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here
```

### Step 4: Restart Dev Server

After adding the token, restart your dev server:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Pricing

- **Free tier:** 50,000 map loads per month
- More than enough for a tourism website
- No credit card required for free tier

## Security Notes

- Public tokens (pk.*) are safe to expose in client-side code
- They can only be used for map display, not admin operations
- You can restrict token usage to specific URLs in Mapbox dashboard

## Troubleshooting

### "NEXT_PUBLIC_MAPBOX_TOKEN not set" error

- Make sure you added the token to `.env.local`
- Make sure you restarted the dev server after adding it
- Check that the file is named exactly `.env.local` (not `.env` or `env.local`)

### Maps not loading

- Check browser console for errors
- Verify token is correct (starts with `pk.`)
- Check your internet connection
- Try creating a new token in Mapbox dashboard

### Token not working

- Make sure you copied the entire token (they're long!)
- Don't include any quotes or spaces in `.env.local`
- Check Mapbox dashboard to see if token is active

## Alternative: Use Without Maps (Temporary)

If you want to skip maps for now, the site will still work. The map component checks for the token and shows a placeholder if missing.

## Your .env.local Should Look Like This

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ixjiaggaxkxkxefqgnrx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibXl1c2VybmFtZSIsImEiOiJjbHh4eHh4eHgifQ...
```

## Additional Resources

- Mapbox Documentation: https://docs.mapbox.com/mapbox-gl-js/
- Token Management: https://account.mapbox.com/access-tokens/
- Pricing: https://www.mapbox.com/pricing/
