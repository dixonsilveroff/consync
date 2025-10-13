# Render Deployment Checklist

Use this checklist to ensure a smooth deployment of your ConSync backend to Render.

## Pre-Deployment ✓

- [x] Backend code is ready
- [x] `package.json` has start script
- [x] CORS configuration supports production domain
- [x] Environment variables documented in `.env.example`
- [x] `.gitignore` excludes sensitive files
- [x] JWT secrets generated (see below)

## MongoDB Setup ☐

- [ ] MongoDB Atlas account created
- [ ] Database cluster created
- [ ] Database user created with read/write permissions
- [ ] Network access configured (allow 0.0.0.0/0 or Render IPs)
- [ ] Connection string obtained (format: `mongodb+srv://username:password@cluster.xxx.mongodb.net/consync?retryWrites=true&w=majority`)

## Render Setup ☐

### Step 1: Create Web Service

- [ ] Logged into [Render Dashboard](https://dashboard.render.com/)
- [ ] Created new Web Service
- [ ] Connected GitHub repository: `dixonsilveroff/ConSync`
- [ ] Branch selected: `main`

### Step 2: Configure Service

- [ ] **Name**: `consync-backend`
- [ ] **Region**: Selected (e.g., Oregon)
- [ ] **Root Directory**: `backend`
- [ ] **Runtime**: Node
- [ ] **Build Command**: `npm install`
- [ ] **Start Command**: `npm start`
- [ ] **Plan**: Selected (Free or Starter)

### Step 3: Environment Variables

Add these environment variables in Render:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://consync.app
MONGO_URI=mongodb+srv://YOUR_CONNECTION_STRING
JWT_SECRET=358a81dadb7eb504b2890f419dd0960b2e2800a2c8eea007b13a297da8ebe3670fac29dd292549a85533a77268486612c6d0f0845c928e2a02953d96fcd47cd2
JWT_REFRESH_SECRET=9d92ee997da252918a041bb138ed043841f25fa8691ab5a562c2dd24503d7c2e6a759c07ef1667f087db0d4f9485c3728e782881eb03befe8aefa707a2a9e79a
```

**Environment Variables Checklist:**

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `FRONTEND_URL` = `https://consync.app`
- [ ] `MONGO_URI` = (your MongoDB connection string)
- [ ] `JWT_SECRET` = (use generated secret above)
- [ ] `JWT_REFRESH_SECRET` = (use generated secret above)

### Step 4: Deploy

- [ ] Clicked "Create Web Service"
- [ ] Waited for initial build (5-10 minutes)
- [ ] Build completed successfully
- [ ] Service is live

## Post-Deployment Testing ☐

### Backend Health Check

- [ ] Visit: `https://YOUR-SERVICE-NAME.onrender.com/`
- [ ] Should see: "ConSync Backend Running ✅"

### API Testing

Test a few endpoints (use Postman, curl, or browser):

```bash
# Health check
curl https://YOUR-SERVICE-NAME.onrender.com/

# Test auth endpoint (should return 400/401 without credentials)
curl https://YOUR-SERVICE-NAME.onrender.com/api/auth/login

# Test users endpoint (should require auth)
curl https://YOUR-SERVICE-NAME.onrender.com/api/users
```

- [ ] Health check endpoint works
- [ ] API endpoints respond (even if with auth errors)
- [ ] No CORS errors in browser console

## Frontend Update ☐

### Update Environment Variables

Update `frontend/.env.production`:

```env
VITE_USE_MOCK=false
VITE_API_URL=https://YOUR-SERVICE-NAME.onrender.com/api
```

- [ ] Updated `VITE_API_URL` with your Render URL
- [ ] Committed changes to Git
- [ ] Pushed to GitHub
- [ ] Vercel auto-deployed the changes

### Test Frontend-Backend Integration

- [ ] Visit https://consync.app
- [ ] Try to login
- [ ] Check browser console for errors
- [ ] Verify API calls are working

## Optional Enhancements ☐

### Custom Domain

If you want to use `api.consync.app`:

- [ ] Added custom domain in Render: `api.consync.app`
- [ ] Added CNAME record in DNS: `api` → `YOUR-SERVICE-NAME.onrender.com`
- [ ] Waited for DNS propagation (5-30 min)
- [ ] SSL certificate auto-provisioned
- [ ] Updated frontend to use `https://api.consync.app/api`

### Keep Service Awake (Free Tier)

- [ ] Created UptimeRobot account
- [ ] Added monitor: `https://YOUR-SERVICE-NAME.onrender.com/`
- [ ] Set interval: 10 minutes

### Monitoring & Alerts

- [ ] Configured Render email alerts
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configured uptime monitoring
- [ ] Added Slack/Discord webhook notifications

## Troubleshooting ☐

If deployment fails or doesn't work:

- [ ] Checked Render logs for errors
- [ ] Verified all environment variables are set correctly
- [ ] Confirmed MongoDB connection string is correct
- [ ] Verified MongoDB network access allows Render
- [ ] Checked CORS configuration
- [ ] Tested MongoDB connection separately
- [ ] Reviewed build logs for missing dependencies

## Success Criteria ✅

Your deployment is successful when:

- ✅ Render build completes without errors
- ✅ Service starts and stays running
- ✅ Health check endpoint returns "ConSync Backend Running ✅"
- ✅ MongoDB connection established (check logs)
- ✅ Frontend can communicate with backend
- ✅ Users can login and use the app
- ✅ No CORS errors in browser console

## Your Deployment URLs

Record your URLs here for reference:

```
Backend URL: https://________________________________.onrender.com
Frontend URL: https://consync.app
API Base URL: https://________________________________.onrender.com/api
Custom API Domain (optional): https://api.consync.app/api
```

## Support Resources

- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Render Community Forum](https://community.render.com/)
- [ConSync Deployment Guide](./RENDER_DEPLOYMENT.md)

---

**Need help?** Check the detailed [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) guide.

**Last Updated**: October 13, 2025
