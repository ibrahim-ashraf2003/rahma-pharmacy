# 🚀 Tammi Sports Production Deployment Guide

Follow these steps to deploy the Tammi Sports platform to **Railway** (Backend) and **Vercel** (Frontend).

## 1. Backend Deployment (Railway)

1. **Push your code** to a GitHub repository.
2. Link the repository to a new project on [Railway.app](https://railway.app/).
3. Add a **MongoDB** service to your project.
4. Set the following **Environment Variables** in the Backend service settings:

| Variable | Description | Source |
| :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Connection String | Railway MongoDB Service |
| `JWT_SECRET` | A long, random string for security | Generate one ($ openssl rand -base64 32) |
| `PORT` | `5000` (default) | Railway will assign it |
| `NODE_ENV` | `production` | Manual |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Name | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Cloudinary Dashboard |
| `EMAIL_USER` | Gmail Address | Your Gmail |
| `EMAIL_PASS` | Gmail App Password | [Google Account Security](https://myaccount.google.com/apppasswords) |
| `PAYMOB_API_KEY` | Paymob API Key | Paymob Dashboard -> Settings |
| `PAYMOB_INTEGRATION_ID` | Paymob Integration ID (Card) | Paymob Dashboard -> Integrations |
| `PAYMOB_IFRAME_ID` | Paymob Iframe ID | Paymob Dashboard -> Iframes |
| `PAYMOB_HMAC_SECRET` | Paymob HMAC Key | Paymob Dashboard -> Settings |

---

## 2. Frontend Deployment (Vercel)

1. Create a new project on [Vercel](https://vercel.com/) and link your GitHub repo.
2. Set the "Root Directory" to your project root (if prompted).
3. Set the following **Environment Variables**:

| Variable | Value |
| :--- | :--- |
| `VITE_API_URL` | Your Railway Backend URL (e.g., `https://tammi-backend.up.railway.app`) |

---

## 3. Paymob Final Configuration

1. In the **Paymob Dashboard**, go to your Card Integration.
2. Set the **Transaction Processed Callback** to:
   `https://your-backend-url.railway.app/api/payments/callback`
3. Set the **Transaction Response Callback** to:
   `https://your-frontend-url.vercel.app/payment-status` (Create this page or redirect to home)

---

## 4. Verification Checkpoint

> [!IMPORTANT]
> Before going live, ensure:
> - `JWT_SECRET` is the same on local and production.
> - `EMAIL_PASS` is an "App Password," not your regular Gmail password.
> - Cloudinary storage is active.

### Test Flow:
1. Register/Login as Admin.
2. Upload a Product (Cloudinary check).
3. Place a test order (Paymob check).
4. Verify email delivery (Nodemailer check).
