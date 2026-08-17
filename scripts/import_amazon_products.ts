import 'dotenv/config';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';

/**
 * Amazon Egypt Product Advertising API importer.
 *
 * Required environment variables:
 * AMAZON_ACCESS_KEY
 * AMAZON_SECRET_KEY
 * AMAZON_PARTNER_TAG
 * MONGODB_URI
 *
 * Optional:
 * AMAZON_IMPORT_TARGET (default 1000)
 *
 * The importer uses Amazon's official PA-API rather than scraping product pages.
 * Prices, ratings and images come from the API response when available.
 */

const endpoint = 'https://webservices.amazon.eg/paapi5/searchitems';
const host = 'webservices.amazon.eg';
const region = 'eu-west-1';
const service = 'ProductAdvertisingAPI';
const target = Number(process.env.AMAZON_IMPORT_TARGET || 1000);

const keywords = [
  ['العناية بالبشرة', 'العناية بالبشرة'],
  ['skincare', 'العناية بالبشرة'],
  ['face wash', 'العناية بالبشرة'],
  ['moisturizer', 'العناية بالبشرة'],
  ['serum', 'العناية بالبشرة'],
  ['sunscreen', 'واقي الشمس'],
  ['shampoo', 'العناية بالشعر'],
  ['conditioner', 'العناية بالشعر'],
  ['hair oil', 'العناية بالشعر'],
  ['hair mask', 'العناية بالشعر'],
  ['hair serum', 'العناية بالشعر'],
  ['makeup', 'مستحضرات التجميل'],
  ['foundation', 'مستحضرات التجميل'],
  ['mascara', 'مستحضرات التجميل'],
  ['lipstick', 'مستحضرات التجميل'],
  ['body lotion', 'العناية بالجسم'],
  ['body wash', 'العناية بالجسم'],
  ['deodorant', 'مزيلات العرق'],
  ['toothpaste', 'العناية بالفم والأسنان'],
  ['mouthwash', 'العناية بالفم والأسنان'],
  ['baby shampoo', 'الأطفال'],
  ['baby lotion', 'الأطفال'],
];

function sha256(value: string) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hmac(key: Buffer | string, value: string) {
  return crypto.createHmac('sha256', key).update(value).digest();
}

function signingKey(secret: string, date: string) {
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

function signRequest(body: string, accessKey: string, secretKey: string) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const contentHash = sha256(body);
  const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=UTF-8\nhost:${host}\nx-amz-date:${amzDate}\nx-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems\n`;
  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
  const canonicalRequest = [
    'POST',
    '/paapi5/searchitems',
    '',
    canonicalHeaders,
    signedHeaders,
    contentHash,
  ].join('\n');
  const scope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${sha256(canonicalRequest)}`;
  const signature = crypto.createHmac('sha256', signingKey(secretKey, date)).update(stringToSign).digest('hex');

  return {
    'content-encoding': 'amz-1.0',
    'content-type': 'application/json; charset=UTF-8',
    host,
    'x-amz-date': amzDate,
    'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
    Authorization: `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

function getPrice(item: any) {
  const listing = item?.Offers?.Listings?.[0];
  return listing?.Price?.Amount ?? item?.Offers?.Listings?.[0]?.Price?.DisplayAmount;
}

function getListPrice(item: any) {
  const listing = item?.Offers?.Listings?.[0];
  return listing?.SavingBasis?.Amount ?? listing?.Price?.Amount;
}

function parseNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return undefined;
  const n = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : undefined;
}

async function searchItems(keyword: string, page: number) {
  const accessKey = process.env.AMAZON_ACCESS_KEY;
  const secretKey = process.env.AMAZON_SECRET_KEY;
  const partnerTag = process.env.AMAZON_PARTNER_TAG;
  if (!accessKey || !secretKey || !partnerTag) {
    throw new Error('Missing AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY or AMAZON_PARTNER_TAG');
  }

  const body = JSON.stringify({
    Keywords: keyword,
    Resources: [
      'ItemInfo.Title',
      'ItemInfo.Features',
      'ItemInfo.ByLineInfo',
      'Images.Primary.Large',
      'Images.Variants.Large',
      'Offers.Listings.Price',
      'Offers.Listings.SavingBasis',
      'CustomerReviews.Count',
      'CustomerReviews.StarRating',
    ],
    PartnerTag: partnerTag,
    PartnerType: 'Associates',
    Marketplace: 'www.amazon.eg',
    SearchIndex: 'Beauty',
    ItemPage: page,
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: signRequest(body, accessKey, secretKey),
    body,
  });

  const text = await response.text();
  if (!response.ok) throw new Error(`Amazon PA-API ${response.status}: ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

function toProduct(item: any, fallbackCategory: string, rank: number) {
  const price = parseNumber(getPrice(item));
  if (!price || price <= 0) return null;

  const listPrice = parseNumber(getListPrice(item));
  const originalPrice = listPrice && listPrice > price ? listPrice : undefined;
  const title = item?.ItemInfo?.Title?.DisplayValue?.trim();
  const image = item?.Images?.Primary?.Large?.URL;
  if (!title || !image) return null;

  const features = item?.ItemInfo?.Features?.DisplayValues || [];
  const description = features.slice(0, 4).join(' • ') || `منتج ${title} من فئة ${fallbackCategory}.`;
  const rating = Number(item?.CustomerReviews?.StarRating?.Value || 0) || 0;
  const reviewsCount = Number(item?.CustomerReviews?.Count || 0) || 0;
  const asin = item?.ASIN;

  return {
    name: title,
    description,
    price: Math.round(price * 100) / 100,
    ...(originalPrice ? { originalPrice: Math.round(originalPrice * 100) / 100 } : {}),
    image,
    images: [image, ...(item?.Images?.Variants?.Large || []).map((x: any) => x?.URL).filter(Boolean).slice(0, 5)],
    category: fallbackCategory,
    subCategory: undefined,
    stock: 50,
    badge: originalPrice ? `${Math.round((1 - price / originalPrice) * 100)}% خصم` : undefined,
    featured: rank <= 10,
    active: true,
    averageRating: rating,
    reviewsCount,
    popularityRank: rank,
    source: 'Amazon.eg PA-API',
    sourceAsin: asin,
    sourceUrl: item?.DetailPageURL,
  };
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
  await mongoose.connect(process.env.MONGODB_URI);

  const seen = new Set<string>();
  let imported = 0;
  let rank = 1;

  try {
    outer: for (const [keyword, category] of keywords) {
      for (let page = 1; page <= 10; page++) {
        if (imported >= target) break outer;
        const data = await searchItems(keyword, page);
        const items = data?.SearchResult?.Items || [];
        if (!items.length) break;

        for (const item of items) {
          const asin = item?.ASIN;
          if (!asin || seen.has(asin)) continue;
          const product = toProduct(item, category, rank++);
          if (!product) continue;
          seen.add(asin);

          await Product.updateOne(
            { sourceAsin: asin },
            { $set: product },
            { upsert: true },
          );
          imported++;
          if (imported >= target) break outer;
        }
      }
    }

    console.log(`Imported/updated ${imported} Amazon.eg products.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
