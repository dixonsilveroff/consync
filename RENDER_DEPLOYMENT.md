# Backend Deployment Guide - Render

This guide will help you deploy the ConSync backend to Render.

## Prerequisites

- [Render Account](https://render.com) (free tier works fine)
- MongoDB Atlas account with a database set up
- Your GitHub repository connected to Render

## Deployment Steps

### Option 1: Deploy via Render Dashboard (Recommended)

1. **Login to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Sign in with your GitHub account

2. **Create a New Web Service**
   - Click "New +" button
   - Select "Web Service"
   - Connect your GitHub repository: `dixonsilveroff/ConSync`
   - Click "Connect"

3. **Configure the Service**
   - **Name**: `consync-backend`
   - **Region**: Choose closest to your users (e.g., Oregon, Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid for better performance)

4. **Add Environment Variables**
   Click "Advanced" and add the following environment variables:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `NODE_ENV` | `production` | Required |
   | `PORT` | `10000` | Render's default port |
   | `FRONTEND_URL` | `https://consync.app` | Your Vercel domain |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | (generate random) | Use a strong random string |
   | `JWT_REFRESH_SECRET` | (generate random) | Use a different random string |

   **Generate secure secrets:**
   ```bash
   # Run this in terminal to generate random secrets
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your backend
   - Wait for the deployment to complete (5-10 minutes)

6. **Get Your Backend URL**
   - Once deployed, you'll get a URL like: `https://consync-backend.onrender.com`
   - Test it by visiting: `https://consync-backend.onrender.com/` (should show "ConSync Backend Running ✅")

### Option 2: Deploy via render.yaml (Infrastructure as Code)

1. **Login to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)

2. **Create New Blueprint**
   - Click "New +" → "Blueprint"
   - Select your repository: `dixonsilveroff/ConSync`
   - Render will detect the `render.yaml` file automatically

3. **Configure Environment Variables**
   - You'll be prompted to add the `MONGO_URI` (marked as `sync: false` in render.yaml)
   - Other secrets will be auto-generated

4. **Apply Blueprint**
   - Click "Apply"
   - Your service will be created and deployed automatically

## Post-Deployment

### 1. Update Frontend Configuration

Update your frontend `.env.production` file:

```env
VITE_USE_MOCK=false
VITE_API_URL=https://consync-backend.onrender.com/api
```

Redeploy your Vercel frontend:
```bash
git add frontend/.env.production
git commit -m "Update API URL to Render backend"
git push
```

### 2. Test Your Backend

Test these endpoints:

```bash
# Health check
curl https://consync-backend.onrender.com/

# API endpoints (replace with your actual URL)
curl https://consync-backend.onrender.com/api/auth/login
```

### 3. Configure Custom Domain (Optional)

If you want to use `api.consync.app`:

1. In Render Dashboard, go to your service
2. Click "Settings" → "Custom Domain"
3. Add domain: `api.consync.app`
4. Add the CNAME record to your domain provider:
   - Type: `CNAME`
   - Name: `api`
   - Value: `consync-backend.onrender.com`
5. Wait for DNS propagation (5-30 minutes)

Then update frontend to use: `VITE_API_URL=https://api.consync.app/api`

### 4. Set Up MongoDB Atlas Network Access

Make sure your MongoDB Atlas allows connections from Render:

1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Add `0.0.0.0/0` (allows all) or specific Render IPs
4. Save

## Important Notes

### Free Tier Limitations

- **Spin down**: Free services sleep after 15 minutes of inactivity
- **Cold starts**: First request after sleep takes 30-50 seconds
- **Hours limit**: 750 hours/month (multiple services share this)

### Performance Tips

1. **Upgrade to Paid Plan** ($7/month) for:
   - No spin down
   - Better performance
   - More resources

2. **Keep Service Awake** (Free tier workaround):
   - Use a service like [UptimeRobot](https://uptimerobot.com/) or [Cron-job.org](https://cron-job.org/)
   - Ping your backend every 10 minutes: `https://consync-backend.onrender.com/`

### Monitoring

1. Check logs in Render Dashboard → Your Service → Logs
2. Monitor deployments in the "Events" tab
3. Set up alerts for deployment failures

## Troubleshooting

### Build Fails

- Check that `backend/package.json` has all required dependencies
- Verify build command is correct: `npm install`
- Check logs for specific error messages

### Deployment Succeeds but App Doesn't Work

1. **Check Environment Variables**: Make sure all required env vars are set
2. **Check MongoDB Connection**: Verify MONGO_URI is correct and network access is configured
3. **Check CORS**: Ensure FRONTEND_URL matches your Vercel domain
4. **View Logs**: Check Render logs for runtime errors

### MongoDB Connection Error

- Verify MONGO_URI is correct (check for special characters that need encoding)
- Ensure MongoDB Atlas network access allows Render (0.0.0.0/0)
- Check MongoDB user permissions

### CORS Errors

- Make sure `FRONTEND_URL` is set to `https://consync.app` (no trailing slash)
- Verify your Vercel domain is correct
- Check backend CORS configuration in `server.js`

## Useful Commands

```bash
# Generate JWT secrets locally
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Test API from terminal
curl https://consync-backend.onrender.com/

# View logs (after setting up Render CLI)
render logs -s consync-backend
```

## Next Steps

After successful deployment:

1. ✅ Test all API endpoints
2. ✅ Update frontend configuration
3. ✅ Set up custom domain (optional)
4. ✅ Configure uptime monitoring
5. ✅ Set up error tracking (e.g., Sentry)
6. ✅ Enable HTTPS (automatic with Render)
7. ✅ Configure production database backups

## Resources

- [Render Documentation](https://render.com/docs)
- [Node.js Deployment Guide](https://render.com/docs/deploy-node-express-app)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Custom Domains](https://render.com/docs/custom-domains)

---

**Questions?** Check the [Render Community Forum](https://community.render.com/) or contact support.
