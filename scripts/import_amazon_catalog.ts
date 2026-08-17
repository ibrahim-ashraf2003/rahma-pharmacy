import 'dotenv/config';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';

const endpoint = 'https://webservices.amazon.eg/paapi5/searchitems';
const host = 'webservices.amazon.eg';
const region = 'eu-west-1';
const service = 'ProductAdvertisingAPI';
const target = Number(process.env.AMAZON_IMPORT_TARGET || 1000);

const searches: Array<[string, string]> = [
  ['skincare', 'العناية بالبشرة'], ['face wash', 'العناية بالبشرة'], ['moisturizer', 'العناية بالبشرة'],
  ['serum', 'العناية بالبشرة'], ['sunscreen', 'واقي الشمس'], ['shampoo', 'العناية بالشعر'],
  ['conditioner', 'العناية بالشعر'], ['hair oil', 'العناية بالشعر'], ['hair mask', 'العناية بالشعر'],
  ['hair serum', 'العناية بالشعر'], ['makeup', 'مستحضرات التجميل'], ['foundation', 'مستحضرات التجميل'],
  ['concealer', 'مستحضرات التجميل'], ['mascara', 'مستحضرات التجميل'], ['lipstick', 'مستحضرات التجميل'],
  ['body lotion', 'العناية بالجسم'], ['body wash', 'العناية بالجسم'], ['deodorant', 'مزيلات العرق'],
  ['toothpaste', 'العناية بالفم والأسنان'], ['mouthwash', 'العناية بالفم والأسنان'],
  ['baby shampoo', 'الأطفال'], ['baby lotion', 'الأطفال'],
];

const sha256 = (v: string) => crypto.createHash('sha256').update(v).digest('hex');
const hmac = (key: Buffer | string, v: string) => crypto.createHmac('sha256', key).update(v).digest();

function headers(body: string) {
  const access = process.env.AMAZON_ACCESS_KEY;
  const secret = process.env.AMAZON_SECRET_KEY;
  if (!access || !secret || !process.env.AMAZON_PARTNER_TAG) throw new Error('Missing Amazon PA-API credentials');
  const now = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = now.slice(0, 8);
  const canonicalHeaders = `content-encoding:amz-1.0\ncontent-type:application/json; charset=UTF-8\nhost:${host}\nx-amz-date:${now}\nx-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems\n`;
  const signed = 'content-encoding;content-type;host;x-amz-date;x-amz-target';
  const canonical = ['POST', '/paapi5/searchitems', '', canonicalHeaders, signed, sha256(body)].join('\n');
  const scope = `${date}/${region}/${service}/aws4_request`;
  const kDate = hmac(`AWS4${secret}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const key = hmac(kService, 'aws4_request');
  const signature = crypto.createHmac('sha256', key).update(`AWS4-HMAC-SHA256\n${now}\n${scope}\n${sha256(canonical)}`).digest('hex');
  return {
    'content-encoding': 'amz-1.0', 'content-type': 'application/json; charset=UTF-8', host,
    'x-amz-date': now, 'x-amz-target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
    Authorization: `AWS4-HMAC-SHA256 Credential=${access}/${scope}, SignedHeaders=${signed}, Signature=${signature}`,
  };
}

const number = (v: unknown) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v !== 'string') return undefined;
  const n = Number(v.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : undefined;
};

async function search(keyword: string, page: number) {
  const body = JSON.stringify({
    Keywords: keyword,
    Resources: ['ItemInfo.Title', 'ItemInfo.Features', 'Images.Primary.Large', 'Images.Variants.Large', 'Offers.Listings.Price', 'Offers.Listings.SavingBasis', 'CustomerReviews.Count', 'CustomerReviews.StarRating'],
    PartnerTag: process.env.AMAZON_PARTNER_TAG,
    PartnerType: 'Associates', Marketplace: 'www.amazon.eg', SearchIndex: 'Beauty', ItemPage: page,
  });
  const r = await fetch(endpoint, { method: 'POST', headers: headers(body), body });
  const text = await r.text();
  if (!r.ok) throw new Error(`Amazon PA-API ${r.status}: ${text.slice(0, 600)}`);
  return JSON.parse(text);
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
  await mongoose.connect(process.env.MONGODB_URI);
  const seen = new Set<string>();
  let imported = 0;
  let rank = 1;
  try {
    for (const [keyword, category] of searches) {
      if (imported >= target) break;
      for (let page = 1; page <= 10 && imported < target; page++) {
        const data = await search(keyword, page);
        const items = data?.SearchResult?.Items || [];
        if (!items.length) break;
        for (const item of items) {
          const title = item?.ItemInfo?.Title?.DisplayValue?.trim();
          const image = item?.Images?.Primary?.Large?.URL;
          const price = number(item?.Offers?.Listings?.[0]?.Price?.Amount);
          const basis = number(item?.Offers?.Listings?.[0]?.SavingBasis?.Amount);
          const asin = item?.ASIN;
          if (!title || !image || !price || !asin || seen.has(asin)) continue;
          seen.add(asin);
          const originalPrice = basis && basis > price ? basis : undefined;
          const rating = Number(item?.CustomerReviews?.StarRating?.Value || 0) || 0;
          const reviewsCount = Number(item?.CustomerReviews?.Count || 0) || 0;
          const features = item?.ItemInfo?.Features?.DisplayValues || [];
          await Product.updateOne(
            { name: title },
            { $set: {
              name: title,
              description: features.slice(0, 4).join(' • ') || `منتج ${title} من Amazon.eg ضمن ${category}.`,
              price: Math.round(price * 100) / 100,
              ...(originalPrice ? { originalPrice: Math.round(originalPrice * 100) / 100 } : {}),
              image,
              images: [image, ...(item?.Images?.Variants?.Large || []).map((x: any) => x?.URL).filter(Boolean).slice(0, 5)],
              category,
              stock: 50,
              badge: originalPrice ? `خصم ${Math.round((1 - price / originalPrice) * 100)}%` : undefined,
              featured: rank <= 20,
              active: true,
              averageRating: rating,
              reviewsCount,
              popularityRank: rank++,
            } },
            { upsert: true },
          );
          imported++;
          if (imported >= target) break;
        }
      }
    }
    console.log(`Imported/updated ${imported} Amazon.eg beauty products.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
