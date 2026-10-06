# Cloud ERP Student Systems

A static, single-page React learning hub. No backend, no database — everything
runs in the browser, which makes it a perfect fit for AWS's **free tier static
hosting** (no EC2, no RDS, no ongoing compute cost).

## 1. Build it locally

You'll need Node.js 18+ installed on your own machine.

```bash
npm install
npm run build
```

This produces a `dist/` folder containing plain HTML/CSS/JS — that folder is
everything you deploy.

(Optional) preview it locally first:

```bash
npm run dev
```

## 2. Deploy to AWS — S3 + CloudFront (recommended, $0 on the free tier)

This gives you HTTPS, a CDN, and fits comfortably inside AWS's 12-month free
tier: **S3** (5 GB storage, 20,000 GET requests/month) and **CloudFront**
(1 TB data transfer out + 10,000,000 requests/month). A small static site like
this uses a tiny fraction of those limits.

### Step-by-step (AWS CLI)

Install and configure the AWS CLI first (`aws configure`) with an IAM user
that has S3 and CloudFront permissions.

```bash
# 1. Create a bucket (name must be globally unique)
aws s3 mb s3://your-unique-bucket-name --region us-east-1

# 2. Upload the build
aws s3 sync dist/ s3://your-unique-bucket-name --delete

# 3. Block public access is ON by default — keep it ON.
#    We'll let CloudFront read the bucket privately via Origin Access Control (OAC),
#    which is the current AWS-recommended, secure approach (no public bucket needed).
```

### Step 4 — Create the CloudFront distribution (AWS Console is easiest)

1. Go to **CloudFront → Create distribution**.
2. **Origin domain**: select your S3 bucket (choose the `s3.amazonaws.com`
   origin type, not the website-endpoint type).
3. **Origin access**: choose "Origin access control settings (recommended)" →
   create a new OAC. CloudFront will show you a bucket policy — copy it.
4. Go back to **S3 → your bucket → Permissions → Bucket policy** and paste the
   policy CloudFront gave you (this grants CloudFront read access without
   making the bucket public).
5. **Default root object**: `index.html`.
6. **Viewer protocol policy**: "Redirect HTTP to HTTPS".
7. Create the distribution. It takes a few minutes to deploy.
8. Visit the CloudFront domain it gives you, e.g.
   `https://d123abcxyz.cloudfront.net` — your site is live over HTTPS, free.

### Updating the site later

Whenever you change the code:

```bash
npm run build
aws s3 sync dist/ s3://your-unique-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## 3. Simpler alternative — AWS Amplify Hosting

If you'd rather not touch S3/CloudFront directly, **AWS Amplify Hosting** also
has a free tier (1,000 build minutes/month, 15 GB served/month, 5 GB storage)
and deploys straight from a GitHub/GitLab repo with zero server config:

1. Push this project to a GitHub repo.
2. In the AWS Console, go to **AWS Amplify → Host a web app** → connect the
   repo.
3. Amplify auto-detects the Vite build (`npm run build`, output `dist`) — just
   confirm and deploy.
4. You get a free `https://main.xxxxx.amplifyapp.com` URL with automatic
   redeploys on every git push.

## Notes on staying within the free tier

- This site is 100% static (no server, no database), so there's no compute
  cost to worry about either way.
- Free tier limits reset monthly and the 12-month S3/CloudFront allowance
  starts from when your AWS account was created — check the **Billing →
  Free Tier** page in the AWS Console to track usage.
- Set up a **Billing alarm** (Billing Console → Budgets) for $1 as a safety
  net so you get an email if anything unexpected starts charging.
