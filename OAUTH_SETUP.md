# GitHub OAuth Setup Guide

Follow these steps to enable GitHub login for private repository access.

## Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the application details:

   ```
   Application name: Git Roast Wrapped
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```

4. Click **"Register application"**

## Step 2: Get Credentials

After creating the app:

1. Copy the **Client ID** 
2. Click **"Generate a new client secret"**
3. Copy the **Client Secret** (you won't be able to see it again!)

## Step 3: Update .env File

Add these to your `.env` file:

```bash
GITHUB_ID=your_client_id_from_step_2
GITHUB_SECRET=your_client_secret_from_step_2
AUTH_SECRET=v94noR/pmd9vXrVZYsRUGMQMEYNe32M0RcH0+ujMy00=
NEXTAUTH_URL=http://localhost:3000
```

The `AUTH_SECRET` is already generated for you. Keep it secure!

## Step 4: Test the Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Click **"Login with GitHub"**
4. Authorize the application
5. You should be redirected back and see your GitHub profile

## For Production Deployment

When deploying to production (e.g., Vercel, Netlify):

1. Create a **new OAuth App** with production URLs:
   ```
   Homepage URL: https://yourdomain.com
   Authorization callback URL: https://yourdomain.com/api/auth/callback/github
   ```

2. Update environment variables on your hosting platform:
   - `GITHUB_ID` - Production OAuth app client ID
   - `GITHUB_SECRET` - Production OAuth app client secret
   - `AUTH_SECRET` - Same or generate a new one
   - `NEXTAUTH_URL` - Your production URL (https://yourdomain.com)

## Troubleshooting

### "Redirect URI mismatch"
- Make sure the callback URL in your OAuth app settings exactly matches: `http://localhost:3000/api/auth/callback/github`
- Check that `NEXTAUTH_URL` in `.env` is `http://localhost:3000` (no trailing slash)

### "Invalid client"
- Double-check that `GITHUB_ID` and `GITHUB_SECRET` are correct
- Make sure you copied the client secret immediately after generating it

### Not seeing private repos
- Make sure you're logged in (check for your profile picture in the UI)
- The app only shows YOUR private repos when you're logged in
- Other users' private repos are never accessible (GitHub security policy)

## OAuth Scopes

The app requests these permissions:
- `read:user` - Read your public profile information
- `repo` - Access your repositories (public and private)

These are necessary to fetch complete GitHub statistics including private repositories.
