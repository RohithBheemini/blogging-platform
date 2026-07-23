# Deployment Guide - Inkwell Blog Platform

## Overview

This guide covers deploying the Inkwell blog platform (React frontend + Express backend + MongoDB) to production.

## Recommended Architecture

- **Frontend (React + Vite):** Deploy to Vercel
- **Backend (Express + MongoDB):** Deploy to Render (free tier available)
- **Database:** MongoDB Atlas (free tier)

---

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user with a strong password
4. Whitelist all IP addresses (`0.0.0.0/0`) for initial setup
5. Get your connection string (it looks like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/inkwell?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Render

1. Push your code to GitHub/GitLab
2. Go to [Render](https://render.com) and create an account
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Configure the service:
   - **Name:** `inkwell-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secret-random-string-here
   FRONTEND_URL=https://your-app.vercel.app
   ```

7. Click **Create Web Service**

8. Wait for deployment to complete (usually 2-3 minutes)

9. Note your backend URL (e.g., `https://inkwell-backend.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and create an account
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://inkwell-backend.onrender.com
   ```

6. Click **Deploy**

7. Wait for deployment to complete (usually 1-2 minutes)

8. Note your frontend URL (e.g., `https://inkwell.vercel.app`)

---

## Step 4: Update Backend CORS

1. Go to your Render dashboard
2. Edit the `inkwell-backend` service
3. Update the `FRONTEND_URL` environment variable to match your actual Vercel URL
4. Save changes (Render will auto-redeploy)

---

## Step 5: Test Your Deployment

1. Open your Vercel URL in a browser
2. Test the following features:
   - User registration
   - User login
   - Creating posts
   - Viewing posts
   - Adding comments
   - User profile

---

## Alternative: Deploy Everything to Vercel (Advanced)

If you want to deploy the backend to Vercel as serverless functions, you'll need to refactor the Express app. Here's a high-level overview:

### 1. Restructure the Backend

Create an `api/` directory in the project root:

```
inkwell/
├── api/
│   ├── index.js          # Express app entry point
│   ├── auth.js           # Auth routes
│   ├── posts.js          # Post routes
│   └── comments.js       # Comment routes
├── frontend/
└── ...
```

### 2. Create Serverless Entry Point

Create `api/index.js`:

```javascript
const express = require('express');
const cors = require('cors');
const { connect } = require('./backend/db/mongoose');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Import and use routes
app.use('/api/auth', require('./backend/routes/auth'));
app.use('/api/posts', require('./backend/routes/posts'));
app.use('/api/posts', require('./backend/routes/comments'));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

module.exports = app;
```

### 3. Create Vercel Configuration

Create `vercel.json` in the root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.js"
    },
    {
      "src": "/assets/(.*)",
      "dest": "frontend/dist/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/index.html"
    }
  ]
}
```

### 4. Update Frontend Build Script

In `frontend/package.json`, add:

```json
{
  "scripts": {
    "build": "vite build",
    "vercel-build": "vite build"
  }
}
```

### 5. Deploy to Vercel

1. Push changes to GitHub
2. Import project in Vercel
3. Add environment variables:
   ```
   MONGO_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secret-random-string
   FRONTEND_URL=https://your-app.vercel.app
   ```

---

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Make sure `FRONTEND_URL` matches your exact Vercel URL
2. Check that the URL includes `https://` and no trailing slash
3. Redeploy the backend after changing environment variables

### API Requests Failing

1. Check the backend logs in Render dashboard
2. Verify `MONGO_URI` is correct
3. Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`
4. Check that `JWT_SECRET` is set in production

### Build Failures

1. Check Vercel build logs
2. Ensure `frontend/` directory is set as Root Directory
3. Verify Node.js version compatibility

### Cold Start Delays

Free tier services (Render, Vercel) may have cold start delays:
- First request after inactivity may take 30-60 seconds
- Subsequent requests will be fast
- Consider upgrading to paid tier for production use

---

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | Random secret for JWT signing |
| `FRONTEND_URL` | Yes | Your Vercel frontend URL |
| `PORT` | No | Server port (default: 5000) |

### Frontend (Vercel)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend URL (leave empty if same origin) |

---

## Cost Estimate

- **MongoDB Atlas Free Tier:** $0/month (512MB storage)
- **Render Free Tier:** $0/month (750 hours)
- **Vercel Free Tier:** $0/month (100GB bandwidth)

Total: **$0/month** for personal/learning projects

---

## Security Checklist

- [ ] JWT_SECRET is a strong, random string (32+ characters)
- [ ] MongoDB Atlas has IP whitelist configured
- [ ] CORS only allows your frontend URL
- [ ] Environment variables are not committed to Git
- [ ] HTTPS is enabled (default on Vercel and Render)

---

## Next Steps

After successful deployment:

1. Set up a custom domain on Vercel
2. Configure automatic deployments from GitHub
3. Set up MongoDB Atlas backup schedules
4. Monitor application logs and performance
5. Consider adding rate limiting and additional security measures
