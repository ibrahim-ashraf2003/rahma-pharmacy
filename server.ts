import dotenv from 'dotenv';
dotenv.config();
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET ? "YES" : "NO");

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

import Order from './src/models/Order.js';
import Admin from './src/models/Admin.js';
import Product from './src/models/Product.js';
import Customer from './src/models/Customer.js';
import Coupon from './src/models/Coupon.js';
import Review from './src/models/Review.js';
import { authMiddleware } from './src/middleware/auth.js';
import {
  initialProducts,
  initialCoupons,
  initialOrders,
  initialReviews,
  InMemoryProduct,
  InMemoryCoupon,
  InMemoryOrder,
  InMemoryReview
} from './src/server/mockData.js';

let inMemoryProducts: InMemoryProduct[] = [...initialProducts];
let inMemoryCoupons: InMemoryCoupon[] = [...initialCoupons];
let inMemoryOrders: InMemoryOrder[] = [...initialOrders];
let inMemoryReviews: InMemoryReview[] = [...initialReviews];
let inMemoryCustomers: any[] = [];

const isMongoConnected = () => mongoose.connection.readyState === 1;

mongoose.set('bufferCommands', false);

const __filenameCompat = typeof import.meta?.url === 'string' ? fileURLToPath(import.meta.url) : '';
const __dirnameCompat = __filenameCompat ? path.dirname(__filenameCompat) : process.cwd();

// ─── Cloudinary Config ───
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Multer memory storage ───
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ─── Nodemailer Setup ───
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOrderConfirmationEmail(order: any) {
  if (!order.customer.email) return;

  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <div style="font-weight: bold;">${item.name}</div>
        <div style="font-size: 12px; color: #666;">Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'}</div>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
        ${item.quantity} x LE ${item.price.toLocaleString()}
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
      <h2 style="text-align: center; color: #000;">TAMMI SPORTS</h2>
      <h3 style="text-align: center;">Order Confirmation / تأكيد الطلب</h3>
      <p>Dear ${order.customer.name},</p>
      <p>Thank you for your order! We are preparing it for shipment.</p>
      <p>شكراً لطلبك! نحن نقوم بتجهيزه للشحن حالياً.</p>
      
      <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 8px;">
        <strong>Order Number:</strong> ${order.orderNumber}<br>
        <strong>Total:</strong> LE ${order.total.toLocaleString()}
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        ${itemsHtml}
      </table>

      <div style="margin-top: 20px; text-align: right;">
        <div>Subtotal: LE ${order.subtotal.toLocaleString()}</div>
        <div>Shipping: LE ${order.shippingFee.toLocaleString()}</div>
        ${order.discount > 0 ? `<div style="color: red;">Discount: -LE ${order.discount.toLocaleString()}</div>` : ''}
        <div style="font-size: 18px; font-weight: bold; margin-top: 10px;">Total: LE ${order.total.toLocaleString()}</div>
      </div>

      <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
        Biyala City, Kafr El Sheikh, Egypt | +20 109 434 118
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Tammi Sports" <${process.env.EMAIL_USER}>`,
      to: order.customer.email,
      subject: `Order Confirmation - ${order.orderNumber} - تـأكيد طلبك من تـامـي`,
      html,
    });
    console.log(`📧 Confirmation email sent to ${order.customer.email}`);
  } catch (err) {
    console.error('❌ Email failed:', err);
  }
}

async function sendLowStockAlert(product: any) {
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 2px solid red;">
      <h2 style="color: red;">⚠️ LOW STOCK ALERT</h2>
      <p>Product <strong>${product.name}</strong> is running low on stock.</p>
      <p>Current Quantity: <strong>${product.stock}</strong></p>
      <hr>
      <p>Please restock soon to avoid missing sales.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Tammi Inventory" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to admin
      subject: `⚠️ Low Stock: ${product.name}`,
      html,
    });
    console.log(`📧 Low stock alert sent for ${product.name}`);
  } catch (err) {
    console.error('❌ Alert failed:', err);
  }
}

// ─── Zod Schemas ───
const CustomerInfoSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().min(11, 'Phone must be 11 digits').max(11),
  email: z.string().email().optional().or(z.literal('')),
  governorate: z.string().min(1, 'Governorate is required'),
  city: z.string().optional().default(''),
  address: z.string().min(3, 'Address is required'),
  notes: z.string().optional().default(''),
});

const OrderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  image: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  size: z.string().optional(),
  color: z.string().optional(),
});

const CreateOrderSchema = z.object({
  customer: CustomerInfoSchema,
  items: z.array(OrderItemSchema).min(1, 'Cart must have at least one item'),
  paymentMethod: z.enum(['cash', 'card']),
  couponCode: z.string().optional(),
});

const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  arabicName: z.string().optional(),
  englishName: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().optional(),
  arabicDescription: z.string().optional(),
  englishDescription: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  originalPrice: z.number().positive().optional(),
  oldPrice: z.number().positive().optional(),
  discount: z.number().optional(),
  currency: z.string().optional().default('EGP'),
  image: z.string().min(1, 'Image URL is required'),
  images: z.array(z.string()).optional(),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().optional(),
  sizeVolume: z.string().optional(),
  skinType: z.string().optional(),
  hairType: z.string().optional(),
  targetConcerns: z.array(z.string()).optional(),
  ingredients: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  stock: z.number().int().min(0).default(0),
  badge: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  featured: z.boolean().optional().default(false),
  isBestSeller: z.boolean().optional().default(false),
  isNewArrival: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
  gender: z.enum(['women', 'men', 'unisex', 'kids']).optional(),
  sourceWebsite: z.string().optional(),
  priceSourceUrl: z.string().optional(),
  imageSourceUrl: z.string().optional(),
  lastPriceUpdate: z.string().optional(),
  priceStatus: z.enum(['verified', 'verification_required', 'outdated']).optional(),
  sku: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const CustomerRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(11).max(11),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const CustomerLoginSchema = z.object({
  email: z.string().email('Invalid email / بريد إلكتروني غير صالح'),
  password: z.string().min(1, 'Password is required / كلمة المرور مطلوبة'),
});

const AdminLoginSchema = z.object({
  email: z.string().email('Invalid email / بريد إلكتروني غير صالح'),
  password: z.string().min(1, 'Password is required / كلمة المرور مطلوبة'),
});

// ─── Helper: Consistent Response ───
function sendSuccess(res: express.Response, data: any, status = 200) {
  return res.status(status).json({ success: true, ...data });
}

function sendError(res: express.Response, error: string, status = 400) {
  return res.status(status).json({ success: false, error });
}

// ─── Helper: Upload to Cloudinary ───
function uploadToCloudinary(buffer: Buffer, folder: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

// ─── Customer auth middleware ───
function customerAuthMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Unauthorized', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not defined');
    const decoded = jwt.verify(token, secret) as any;
    (req as any).customer = decoded;
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Enable trust proxy for reverse proxies (nginx / Cloud Run) to support rate limiting & accurate IP resolution
  app.set('trust proxy', 1);

  // ─── Security Middleware ───
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: process.env.CORS_ORIGIN || (isProduction ? true : '*'),
    credentials: true,
  }));

  // Standard API Rate Limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: { 
      success: false, 
      error: 'Too many requests / طلبات كثيرة جداً', 
      error_en: 'Too many requests, please try again later',
      error_ar: 'طلبات كثيرة جداً، يرجى المحاولة لاحقاً'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', apiLimiter);

  // Strict Auth Rate Limiting (5 requests per 15 min)
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { 
      success: false, 
      error: 'Too many attempts / محاولات كثيرة جداً',
      error_en: 'Too many login attempts, please try again in 15 minutes',
      error_ar: 'محاولات دخول كثيرة جداً، يرجى المحاولة بعد 15 دقيقة'
    },
  });

  // Strict Order Rate Limiting (10 requests per hour)
  const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: { 
      success: false, 
      error: 'Order limit reached / تم الوصول لحد الطلبات',
      error_en: 'Daily/Hourly order limit reached, please contact support',
      error_ar: 'وصلت للحد الأقصى للطلبات حالياً، يرجى التواصل مع الدعم'
    },
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Zod Validation Middleware ───
  const validate = (schema: z.ZodSchema) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(err => ({
        field: err.path.join('.'),
        message_en: err.message,
        // Basic translation map for common Zod errors
        message_ar: translateZodError(err)
      }));
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed / فشل التحقق من البيانات',
        errors 
      });
    }
    req.body = result.data;
    next();
  };

  function translateZodError(err: z.ZodIssue): string {
    const fieldNames: Record<string, string> = {
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      password: 'كلمة المرور',
      address: 'العنوان',
      governorate: 'المحافظة',
      price: 'السعر',
      stock: 'الكمية',
    };
    const field = fieldNames[err.path[0] as string] || err.path[0];
    
    if (err.code === 'invalid_string' && err.validation === 'email') return 'بريد إلكتروني غير صالح';
    if (err.code === 'too_small') return `${field} قصير جداً`;
    if (err.code === 'too_big') return `${field} طويل جداً`;
    return `${field} غير صالح`;
  }

  // ─── Database Connection ───
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.warn('WARNING: MONGODB_URI is not defined. Database features will fail.');
  } else {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB');
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
    }
  }

  // ─── Error Handler Middleware ───
  function asyncHandler(fn: (req: express.Request, res: express.Response, next: express.NextFunction) => Promise<any>) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch((err) => {
        console.error('Server Error:', err);
        sendError(res, err instanceof Error ? err.message : 'Internal server error', 500);
      });
    };
  }

  // ═══════════════════════════════════════════════════
  // ═══ ADMIN AUTH ════════════════════════════════════
  // ═══════════════════════════════════════════════════

  app.post('/api/admin/login', authLimiter, validate(AdminLoginSchema), asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const secret = process.env.JWT_SECRET || 'tammi_sports_default_jwt_secret_dev_2026';

    if (isMongoConnected()) {
      try {
        const admin = await Admin.findOne({ email });
        if (admin && await admin.comparePassword(password)) {
          const token = jwt.sign({ id: admin._id, role: admin.role }, secret, { expiresIn: '7d' });
          return sendSuccess(res, {
            token,
            admin: { id: admin._id, email: admin.email, role: admin.role }
          });
        }
      } catch (err) {
        console.warn('MongoDB query failed during admin login, falling back to mock auth:', err);
      }
    }

    // Fallback development/mock admin credentials
    if (
      (email.toLowerCase() === 'admin@tammi.com' && (password === 'admin123' || password === 'adminpassword123')) ||
      (email.toLowerCase() === 'admin@example.com' && (password === 'adminpassword123' || password === 'admin123'))
    ) {
      const token = jwt.sign({ id: 'mock-admin-01', role: 'admin' }, secret, { expiresIn: '7d' });
      return sendSuccess(res, {
        token,
        admin: { id: 'mock-admin-01', email, role: 'admin' }
      });
    }

    return sendError(res, 'Invalid credentials / بيانات الدخول غير صحيحة', 401);
  }));

  // ═══════════════════════════════════════════════════
  // ═══ CUSTOMER AUTH ═════════════════════════════════
  // ═══════════════════════════════════════════════════

  app.post('/api/customers/register', authLimiter, validate(CustomerRegisterSchema), asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;
    const secret = process.env.JWT_SECRET || 'tammi_sports_default_jwt_secret_dev_2026';

    if (isMongoConnected()) {
      try {
        const existing = await Customer.findOne({ email });
        if (existing) return sendError(res, 'Email already registered / هذا البريد مسجل بالفعل', 409);

        const customer = new Customer({ name, email, phone, password });
        await customer.save();

        const token = jwt.sign({ id: customer._id, type: 'customer' }, secret, { expiresIn: '30d' });
        return sendSuccess(res, {
          token,
          customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone }
        }, 201);
      } catch (err) {
        console.warn('MongoDB register error, using in-memory store:', err);
      }
    }

    // In-memory fallback
    if (inMemoryCustomers.some(c => c.email.toLowerCase() === email.toLowerCase())) {
      return sendError(res, 'Email already registered / هذا البريد مسجل بالفعل', 409);
    }
    const newCust = { _id: 'cust-' + Date.now(), name, email, phone, password };
    inMemoryCustomers.push(newCust);
    const token = jwt.sign({ id: newCust._id, type: 'customer' }, secret, { expiresIn: '30d' });
    return sendSuccess(res, {
      token,
      customer: { id: newCust._id, name, email, phone }
    }, 201);
  }));

  app.post('/api/customers/login', authLimiter, validate(CustomerLoginSchema), asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const secret = process.env.JWT_SECRET || 'tammi_sports_default_jwt_secret_dev_2026';

    if (isMongoConnected()) {
      try {
        const customer = await Customer.findOne({ email });
        if (customer && await customer.comparePassword(password)) {
          const token = jwt.sign({ id: customer._id, type: 'customer' }, secret, { expiresIn: '30d' });
          return sendSuccess(res, {
            token,
            customer: { id: customer._id, name: customer.name, email: customer.email, phone: customer.phone }
          });
        }
      } catch (err) {
        console.warn('MongoDB login error, falling back:', err);
      }
    }

    const cust = inMemoryCustomers.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
    if (!cust) return sendError(res, 'Invalid credentials / بيانات الدخول غير صحيحة', 401);

    const token = jwt.sign({ id: cust._id, type: 'customer' }, secret, { expiresIn: '30d' });
    return sendSuccess(res, {
      token,
      customer: { id: cust._id, name: cust.name, email: cust.email, phone: cust.phone }
    });
  }));

  app.get('/api/customers/me', customerAuthMiddleware, asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const customer = await Customer.findById((req as any).customer.id).select('-password');
        if (customer) return sendSuccess(res, { customer });
      } catch (err) {
        console.warn('MongoDB error in /me:', err);
      }
    }
    const cust = inMemoryCustomers.find(c => c._id === (req as any).customer.id);
    if (cust) return sendSuccess(res, { customer: { id: cust._id, name: cust.name, email: cust.email, phone: cust.phone } });
    return sendSuccess(res, { customer: { id: 'cust-demo', name: 'Demo Customer', email: 'customer@tammi.com', phone: '01000000000' } });
  }));

  app.get('/api/customers/orders', customerAuthMiddleware, asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const orders = await Order.find({ customerId: (req as any).customer.id }).sort({ createdAt: -1 });
        return sendSuccess(res, { orders });
      } catch (err) {
        console.warn('MongoDB error in customer orders:', err);
      }
    }
    const orders = inMemoryOrders.filter(o => o.customerId === (req as any).customer.id);
    return sendSuccess(res, { orders });
  }));

  // ═══════════════════════════════════════════════════
  // ═══ PRODUCTS ══════════════════════════════════════
  // ═══════════════════════════════════════════════════

  // Public: list products
  app.get('/api/products', asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const filter: any = {};
        if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
        if (req.query.featured) filter.featured = req.query.featured === 'true';
        if (!req.headers.authorization) filter.active = true;

        const products = await Product.find(filter).sort({ createdAt: -1 });
        if (products.length > 0) {
          return sendSuccess(res, { products });
        }
      } catch (err) {
        console.warn('MongoDB error in GET /api/products, falling back to mock catalog:', err);
      }
    }

    let filtered = [...inMemoryProducts];
    if (req.query.category && req.query.category !== 'All') {
      filtered = filtered.filter(p => p.category.toLowerCase() === (req.query.category as string).toLowerCase());
    }
    if (req.query.featured === 'true') {
      filtered = filtered.filter(p => p.featured);
    }
    if (!req.headers.authorization) {
      filtered = filtered.filter(p => p.active !== false);
    }
    return sendSuccess(res, { products: filtered });
  }));

  // Public: single product
  app.get('/api/products/:id', asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const product = await Product.findById(req.params.id);
        if (product) return sendSuccess(res, { product });
      } catch (err) {
        console.warn('MongoDB error in GET /api/products/:id:', err);
      }
    }
    const product = inMemoryProducts.find(p => p._id === req.params.id || (p as any).id === req.params.id);
    if (!product) return sendError(res, 'Product not found', 404);
    return sendSuccess(res, { product });
  }));

  // Admin: create product
  app.post('/api/products', authMiddleware, validate(ProductSchema), asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        return sendSuccess(res, { product: newProduct }, 201);
      } catch (err) {
        console.warn('MongoDB error creating product:', err);
      }
    }

    const newProd: InMemoryProduct = {
      _id: 'prod-' + Date.now(),
      ...req.body,
      sizes: req.body.sizes || [],
      colors: req.body.colors || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryProducts.unshift(newProd);
    return sendSuccess(res, { product: newProd }, 201);
  }));

  // Admin: update product
  app.put('/api/products/:id', authMiddleware, validate(ProductSchema.partial()), asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedProduct) {
          if (updatedProduct.stock < 5) sendLowStockAlert(updatedProduct);
          return sendSuccess(res, { product: updatedProduct });
        }
      } catch (err) {
        console.warn('MongoDB error updating product:', err);
      }
    }

    const idx = inMemoryProducts.findIndex(p => p._id === req.params.id || (p as any).id === req.params.id);
    if (idx === -1) return sendError(res, 'Product not found', 404);

    inMemoryProducts[idx] = {
      ...inMemoryProducts[idx],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    return sendSuccess(res, { product: inMemoryProducts[idx] });
  }));

  // Admin: delete product
  app.delete('/api/products/:id', authMiddleware, asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (deletedProduct) return sendSuccess(res, { message: 'Product deleted successfully' });
      } catch (err) {
        console.warn('MongoDB error deleting product:', err);
      }
    }

    const idx = inMemoryProducts.findIndex(p => p._id === req.params.id || (p as any).id === req.params.id);
    if (idx === -1) return sendError(res, 'Product not found', 404);
    inMemoryProducts.splice(idx, 1);
    return sendSuccess(res, { message: 'Product deleted successfully' });
  }));

  // ═══════════════════════════════════════════════════
  // ═══ IMAGE UPLOAD ══════════════════════════════════
  // ═══════════════════════════════════════════════════

  app.post('/api/uploads/image', authMiddleware, upload.single('image'), asyncHandler(async (req, res) => {
    const fileReq = req as any;
    if (!fileReq.file) return sendError(res, 'No image file provided');

    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const result = await uploadToCloudinary(fileReq.file.buffer, 'tammi-products');
        return sendSuccess(res, { url: result.secure_url, publicId: result.public_id });
      } catch (err) {
        console.warn('Cloudinary upload failed, falling back to data URL:', err);
      }
    }

    // Fallback: convert file to Base64 data URL
    const mime = fileReq.file.mimetype || 'image/jpeg';
    const base64Data = `data:${mime};base64,${fileReq.file.buffer.toString('base64')}`;
    return sendSuccess(res, { url: base64Data, publicId: 'local-' + Date.now() });
  }));

  // ═══════════════════════════════════════════════════
  // ═══ ORDERS ════════════════════════════════════════
  // ═══════════════════════════════════════════════════

  // Public: create order
  app.post('/api/orders', orderLimiter, validate(CreateOrderSchema), asyncHandler(async (req, res) => {
    const { customer, items, paymentMethod, couponCode } = req.body;

    if (isMongoConnected()) {
      try {
        // Verify products exist and have sufficient stock, calculate server-side totals
        let subtotal = 0;
        const verifiedItems: any[] = [];

        for (const item of items) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return sendError(res, `Product "${item.name}" not found`, 404);
          }
          if (product.stock < item.quantity) {
            return sendError(res, `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`);
          }
          const serverPrice = product.price;
          subtotal += serverPrice * item.quantity;
          verifiedItems.push({
            productId: product._id.toString(),
            name: product.name,
            image: product.image,
            price: serverPrice,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          });
        }

        let discount = 0;
        if (couponCode) {
          const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
          if (coupon) {
            if (coupon.expiresAt && coupon.expiresAt < new Date()) {
              return sendError(res, 'Coupon has expired');
            }
            if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
              return sendError(res, 'Coupon usage limit reached');
            }
            if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
              return sendError(res, `Minimum order amount for this coupon is LE ${coupon.minOrderAmount}`);
            }
            if (coupon.discountType === 'percentage') {
              discount = Math.round(subtotal * (coupon.discountValue / 100));
            } else {
              discount = Math.min(coupon.discountValue, subtotal);
            }
            coupon.usedCount += 1;
            await coupon.save();
          } else {
            return sendError(res, 'Invalid or expired coupon code');
          }
        }

        const shippingFee = 50;
        const total = subtotal - discount + shippingFee;

        const newOrder = new Order({
          customer,
          items: verifiedItems,
          subtotal,
          shippingFee,
          discount,
          couponCode: couponCode?.toUpperCase(),
          total,
          paymentMethod,
          paymentStatus: paymentMethod === 'cash' ? 'pending' : 'pending',
          orderStatus: 'pending',
        });

        await newOrder.save();

        for (const item of verifiedItems) {
          const updatedProduct = await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } },
            { new: true }
          );
          if (updatedProduct && updatedProduct.stock < 5) {
            sendLowStockAlert(updatedProduct);
          }
        }

        if (paymentMethod === 'cash') {
          sendOrderConfirmationEmail(newOrder);
        }

        console.log(`✅ Order ${newOrder.orderNumber} created successfully`);
        return sendSuccess(res, { order: newOrder }, 201);
      } catch (err) {
        console.warn('MongoDB error creating order, using in-memory store:', err);
      }
    }

    // In-memory fallback
    let subtotal = 0;
    const verifiedItems: any[] = [];
    for (const item of items) {
      const product = inMemoryProducts.find(p => p._id === item.productId || (p as any).id === item.productId);
      const price = product ? product.price : (item.price || 0);
      const name = product ? product.name : item.name;
      const image = product ? product.image : item.image;
      subtotal += price * item.quantity;
      if (product) product.stock = Math.max(0, product.stock - item.quantity);
      verifiedItems.push({
        productId: item.productId,
        name,
        image,
        price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      });
    }

    let discount = 0;
    if (couponCode) {
      const coupon = inMemoryCoupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
      if (coupon) {
        discount = coupon.discountType === 'percentage'
          ? Math.round(subtotal * (coupon.discountValue / 100))
          : Math.min(coupon.discountValue, subtotal);
        coupon.usedCount += 1;
      }
    }

    const shippingFee = 50;
    const total = subtotal - discount + shippingFee;
    const newOrder: InMemoryOrder = {
      _id: 'ord-' + Date.now(),
      orderNumber: `TM-${String(inMemoryOrders.length + 101).padStart(6, '0')}`,
      customer,
      items: verifiedItems,
      subtotal,
      shippingFee,
      discount,
      couponCode: couponCode?.toUpperCase(),
      total,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      statusHistory: [{ status: 'pending', date: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inMemoryOrders.unshift(newOrder);
    if (paymentMethod === 'cash') sendOrderConfirmationEmail(newOrder);
    console.log(`✅ Order ${newOrder.orderNumber} created successfully (in-memory)`);
    return sendSuccess(res, { order: newOrder }, 201);
  }));

  // Admin: list orders
  app.get('/api/orders', authMiddleware, asyncHandler(async (_req, res) => {
    if (isMongoConnected()) {
      try {
        const orders = await Order.find().sort({ createdAt: -1 });
        if (orders.length > 0) return sendSuccess(res, { orders });
      } catch (err) {
        console.warn('MongoDB error fetching orders:', err);
      }
    }
    return sendSuccess(res, { orders: inMemoryOrders });
  }));

  // Admin: get single order
  app.get('/api/orders/:id', authMiddleware, asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const order = await Order.findById(req.params.id);
        if (order) return sendSuccess(res, { order });
      } catch (err) {
        console.warn('MongoDB error fetching order:', err);
      }
    }
    const order = inMemoryOrders.find(o => o._id === req.params.id || o.orderNumber === req.params.id);
    if (!order) return sendError(res, 'Order not found', 404);
    return sendSuccess(res, { order });
  }));

  // Admin: update order status (PATCH and PUT both supported)
  const updateOrderHandler = asyncHandler(async (req: express.Request, res: express.Response) => {
    const { orderStatus, paymentStatus } = req.body;

    if (isMongoConnected()) {
      try {
        const order = await Order.findById(req.params.id);
        if (order) {
          if (orderStatus) {
            order.orderStatus = orderStatus;
            order.statusHistory.push({ status: orderStatus, date: new Date() });
          }
          if (paymentStatus) order.paymentStatus = paymentStatus;
          await order.save();
          return sendSuccess(res, { order });
        }
      } catch (err) {
        console.warn('MongoDB error updating order:', err);
      }
    }

    const order = inMemoryOrders.find(o => o._id === req.params.id || o.orderNumber === req.params.id);
    if (!order) return sendError(res, 'Order not found', 404);

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.statusHistory.push({ status: orderStatus, date: new Date().toISOString() });
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();
    return sendSuccess(res, { order });
  });
  
  app.patch('/api/orders/:id', authMiddleware, updateOrderHandler);
  app.put('/api/orders/:id', authMiddleware, updateOrderHandler);

  // ═══════════════════════════════════════════════════
  // ═══ PAYMOB ════════════════════════════════════════
  // ═══════════════════════════════════════════════════

  app.post('/api/paymob/create-order', asyncHandler(async (req, res) => {
    const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY;
    const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID;
    const PAYMOB_IFRAME_ID = process.env.PAYMOB_IFRAME_ID;

    if (!PAYMOB_API_KEY || !PAYMOB_INTEGRATION_ID || !PAYMOB_IFRAME_ID) {
      return sendError(res, 'Paymob is not configured. Please set PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID, PAYMOB_IFRAME_ID.', 500);
    }

    const { orderId, billingData } = req.body;
    if (!orderId) return sendError(res, 'orderId is required');

    let order: any = null;
    if (isMongoConnected()) {
      order = await Order.findById(orderId);
    } else {
      order = inMemoryOrders.find(o => o._id === orderId || o.orderNumber === orderId);
    }
    if (!order) return sendError(res, 'Order not found', 404);

    const authRes = await fetch('https://accept.paymob.com/api/auth/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
    });
    const authData = await authRes.json();
    if (!authData.token) return sendError(res, 'Failed to authenticate with Paymob', 500);

    const paymobOrderRes = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authData.token,
        delivery_needed: 'true',
        amount_cents: Math.round(order.total * 100),
        currency: 'EGP',
        merchant_order_id: order.orderNumber,
        items: order.items.map((item: any) => ({
          name: item.name,
          amount_cents: Math.round(item.price * 100),
          quantity: item.quantity,
        })),
      }),
    });
    const paymobOrderData = await paymobOrderRes.json();
    if (!paymobOrderData.id) return sendError(res, 'Failed to create Paymob order', 500);

    order.paymobOrderId = paymobOrderData.id.toString();
    if (typeof order.save === 'function') await order.save();

    const billing = billingData || {};
    const paymentKeyRes = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authData.token,
        amount_cents: Math.round(order.total * 100),
        expiration: 3600,
        order_id: paymobOrderData.id,
        billing_data: {
          first_name: billing.first_name || order.customer.name.split(' ')[0] || 'NA',
          last_name: billing.last_name || order.customer.name.split(' ').slice(1).join(' ') || 'NA',
          email: billing.email || order.customer.email || 'customer@tammi.com',
          phone_number: billing.phone_number || order.customer.phone || '01000000000',
          apartment: billing.apartment || 'NA',
          floor: billing.floor || 'NA',
          street: billing.street || order.customer.address || 'NA',
          building: billing.building || 'NA',
          shipping_method: 'PKG',
          postal_code: billing.postal_code || '00000',
          city: billing.city || order.customer.governorate || 'Cairo',
          country: 'EG',
          state: billing.state || order.customer.governorate || 'Cairo',
        },
        currency: 'EGP',
        integration_id: parseInt(PAYMOB_INTEGRATION_ID),
      }),
    });
    const paymentKeyData = await paymentKeyRes.json();
    if (!paymentKeyData.token) return sendError(res, 'Failed to generate payment key', 500);

    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_IFRAME_ID}?payment_token=${paymentKeyData.token}`;
    sendSuccess(res, { iframeUrl, paymentToken: paymentKeyData.token, paymobOrderId: paymobOrderData.id });
  }));

  // Paymob webhook callback
  app.post('/api/paymob/callback', asyncHandler(async (req, res) => {
    const { obj, hmac } = req.body;
    if (!obj || !hmac) return sendError(res, 'Invalid callback data');

    const PAYMOB_HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;
    if (PAYMOB_HMAC_SECRET) {
      const data = [
        obj.amount_cents,
        obj.created_at,
        obj.currency,
        obj.error_occured,
        obj.has_parent_transaction,
        obj.id,
        obj.integration_id,
        obj.is_3d_secure,
        obj.is_auth,
        obj.is_capture,
        obj.is_refunded,
        obj.is_standalone_payment,
        obj.is_voided,
        obj.order.id,
        obj.owner,
        obj.pending,
        obj.source_data.pan,
        obj.source_data.sub_type,
        obj.source_data.type,
        obj.success,
      ].join('');

      const hash = crypto.createHmac('sha512', PAYMOB_HMAC_SECRET).update(data).digest('hex');
      if (hash !== hmac) {
        console.warn('⚠️ Paymob HMAC verification failed!');
        return sendError(res, 'HMAC mismatch', 401);
      }
    }

    const orderNo = obj.order?.merchant_order_id;
    if (!orderNo) return sendError(res, 'No merchant order ID in callback');

    let order: any = null;
    if (isMongoConnected()) {
      order = await Order.findOne({ orderNumber: orderNo });
    } else {
      order = inMemoryOrders.find(o => o.orderNumber === orderNo);
    }
    if (!order) return sendError(res, 'Order not found', 404);

    if (obj.success === true) {
      order.paymentStatus = 'paid';
      order.paymobTransactionId = obj.id?.toString();
      order.statusHistory.push({ status: 'payment_confirmed', date: new Date() });
      sendOrderConfirmationEmail(order);
    } else {
      order.paymentStatus = 'failed';
      order.statusHistory.push({ status: 'payment_failed', date: new Date() });
    }

    if (typeof order.save === 'function') await order.save();
    sendSuccess(res, { received: true });
  }));

  // ═══════════════════════════════════════════════════
  // ═══ COUPONS ═══════════════════════════════════════
  // ═══════════════════════════════════════════════════

  // Public: validate coupon
  app.post('/api/coupons/validate', asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body;
    if (!code) return sendError(res, 'Coupon code is required');

    if (isMongoConnected()) {
      try {
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true });
        if (coupon) {
          if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return sendError(res, 'Coupon has expired');
          }
          if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return sendError(res, 'Coupon usage limit reached');
          }
          if (coupon.minOrderAmount && subtotal && subtotal < coupon.minOrderAmount) {
            return sendError(res, `Minimum order amount is LE ${coupon.minOrderAmount}`);
          }
          let discount = 0;
          if (subtotal) {
            if (coupon.discountType === 'percentage') {
              discount = Math.round(subtotal * (coupon.discountValue / 100));
            } else {
              discount = Math.min(coupon.discountValue, subtotal);
            }
          }
          return sendSuccess(res, {
            coupon: {
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue,
            },
            discount,
          });
        }
      } catch (err) {
        console.warn('MongoDB error in coupon validation:', err);
      }
    }

    // In-memory fallback
    const coupon = inMemoryCoupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) return sendError(res, 'Invalid coupon code', 404);
    let discount = 0;
    if (subtotal) {
      if (coupon.discountType === 'percentage') {
        discount = Math.round(subtotal * (coupon.discountValue / 100));
      } else {
        discount = Math.min(coupon.discountValue, subtotal);
      }
    }
    return sendSuccess(res, {
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      discount,
    });
  }));

  // Admin: manage coupons
  app.get('/api/coupons', authMiddleware, asyncHandler(async (_req, res) => {
    if (isMongoConnected()) {
      try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        if (coupons.length > 0) return sendSuccess(res, { coupons });
      } catch (err) {
        console.warn('MongoDB error in GET /api/coupons:', err);
      }
    }
    return sendSuccess(res, { coupons: inMemoryCoupons });
  }));

  app.post('/api/coupons', authMiddleware, asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const coupon = new Coupon(req.body);
        await coupon.save();
        return sendSuccess(res, { coupon }, 201);
      } catch (err) {
        console.warn('MongoDB error saving coupon:', err);
      }
    }

    const newCoupon: InMemoryCoupon = {
      _id: 'cpn-' + Date.now(),
      ...req.body,
      code: (req.body.code || '').toUpperCase(),
      usedCount: 0,
      active: req.body.active !== undefined ? req.body.active : true,
      createdAt: new Date().toISOString(),
    };
    inMemoryCoupons.unshift(newCoupon);
    return sendSuccess(res, { coupon: newCoupon }, 201);
  }));

  app.put('/api/coupons/:id', authMiddleware, asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (coupon) return sendSuccess(res, { coupon });
      } catch (err) {
        console.warn('MongoDB error updating coupon:', err);
      }
    }

    const idx = inMemoryCoupons.findIndex(c => c._id === req.params.id);
    if (idx === -1) return sendError(res, 'Coupon not found', 404);
    inMemoryCoupons[idx] = { ...inMemoryCoupons[idx], ...req.body };
    return sendSuccess(res, { coupon: inMemoryCoupons[idx] });
  }));

  app.delete('/api/coupons/:id', authMiddleware, asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (coupon) return sendSuccess(res, { message: 'Coupon deleted successfully' });
      } catch (err) {
        console.warn('MongoDB error deleting coupon:', err);
      }
    }

    const idx = inMemoryCoupons.findIndex(c => c._id === req.params.id);
    if (idx === -1) return sendError(res, 'Coupon not found', 404);
    inMemoryCoupons.splice(idx, 1);
    return sendSuccess(res, { message: 'Coupon deleted successfully' });
  }));

  // ═══════════════════════════════════════════════════
  // ═══ REVIEWS ═══════════════════════════════════════
  // ═══════════════════════════════════════════════════

  app.get('/api/reviews/:productId', asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const reviews = await Review.find({ productId: req.params.productId, approved: true });
        if (reviews.length > 0) return sendSuccess(res, { reviews });
      } catch (err) {
        console.warn('MongoDB error fetching reviews:', err);
      }
    }
    const reviews = inMemoryReviews.filter(r => r.productId === req.params.productId && r.approved);
    return sendSuccess(res, { reviews });
  }));

  app.post('/api/reviews', asyncHandler(async (req, res) => {
    const isApproved = req.body.approved !== undefined ? req.body.approved : true;
    if (isMongoConnected()) {
      try {
        const review = new Review({ ...req.body, approved: isApproved });
        await review.save();
        return sendSuccess(res, { review }, 201);
      } catch (err) {
        console.warn('MongoDB error creating review:', err);
      }
    }

    const newReview: InMemoryReview = {
      _id: 'rev-' + Date.now(),
      ...req.body,
      approved: isApproved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryReviews.unshift(newReview);
    return sendSuccess(res, { review: newReview }, 201);
  }));

  // Admin: get all reviews
  app.get('/api/reviews', authMiddleware, asyncHandler(async (_req, res) => {
    if (isMongoConnected()) {
      try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        if (reviews.length > 0) return sendSuccess(res, { reviews });
      } catch (err) {
        console.warn('MongoDB error fetching all reviews:', err);
      }
    }
    return sendSuccess(res, { reviews: inMemoryReviews });
  }));

  // Admin: update review (e.g. approve)
  app.patch('/api/reviews/:id', authMiddleware, asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const review = await Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (review) return sendSuccess(res, { review });
      } catch (err) {
        console.warn('MongoDB error updating review:', err);
      }
    }

    const idx = inMemoryReviews.findIndex(r => r._id === req.params.id);
    if (idx === -1) return sendError(res, 'Review not found', 404);
    inMemoryReviews[idx] = { ...inMemoryReviews[idx], ...req.body };
    return sendSuccess(res, { review: inMemoryReviews[idx] });
  }));

  // Admin: delete review
  app.delete('/api/reviews/:id', authMiddleware, asyncHandler(async (req, res) => {
    if (isMongoConnected()) {
      try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (review) return sendSuccess(res, { message: 'Review deleted successfully' });
      } catch (err) {
        console.warn('MongoDB error deleting review:', err);
      }
    }

    const idx = inMemoryReviews.findIndex(r => r._id === req.params.id);
    if (idx === -1) return sendError(res, 'Review not found', 404);
    inMemoryReviews.splice(idx, 1);
    return sendSuccess(res, { message: 'Review deleted successfully' });
  }));

  // ─── Database Offline Error Interceptor Middleware ───
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || (err.message && err.message.includes('buffering timed out'))) {
      console.warn('[AI Studio] Database offline error caught — serving graceful response');
      if (req.method === 'GET') {
        return res.json({ success: true, products: inMemoryProducts, orders: inMemoryOrders, coupons: inMemoryCoupons, reviews: inMemoryReviews });
      }
      return res.status(503).json({ success: false, error: 'Service temporarily unavailable (database offline)' });
    }
    next(err);
  });

  // ═══════════════════════════════════════════════════
  // ═══ VITE / STATIC ═════════════════════════════════
  // ═══════════════════════════════════════════════════

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ─── Global Error Handler ───
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled Error:', err);
    sendError(res, err.message || 'Internal Server Error', 500);
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📖 Environment: ${isProduction ? 'production' : 'development'}`);
  });
}

startServer();
