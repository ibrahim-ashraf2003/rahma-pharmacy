import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './src/models/Product.js';

const IMG = {
  hair: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
  skin: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80',
  body: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=800&q=80',
  sun: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
  dental: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80',
  baby: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
};

// Amazon Egypt is used as a market-reference source for product selection.
// Prices here are Rahma Pharmacy starting prices, not live Amazon prices.
// Ranking is based on the Amazon Egypt search/review signals available during research.
const products = [
  // Hair care / shampoo
  ['L’Oréal Paris Elvive Hyaluron Pure Purifying Shampoo 400ml', 'شامبو لتنقية الشعر الدهني.', 119.95, 125, 'العناية بالشعر', 'شامبو', 1, IMG.hair, 4.4, 119, true],
  ['Sunsilk Shampoo Black Shine 1L', 'شامبو صانسيلك بلاك شاين بحجم 1 لتر.', 169.95, 225, 'العناية بالشعر', 'شامبو', 2, IMG.hair, 4.3, 89, true],
  ['L’Oréal Paris Elvive Total Repair 5 Shampoo 400ml', 'شامبو لإصلاح الشعر المتضرر والعناية اليومية.', 119.95, undefined, 'العناية بالشعر', 'شامبو', 3, IMG.hair, 4.4, 625, true],
  ['L’Oréal Paris Elvive Full Resist Shampoo 600ml', 'شامبو للعناية بالشعر وتقليل مظهر التكسر.', 180, undefined, 'العناية بالشعر', 'شامبو', 4, IMG.hair, 4.5, 333, false],
  ['L’Oréal Paris Elvive Hyaluron Pure Purifying Shampoo 600ml', 'شامبو لتنقية الشعر الدهني.', 150, 158, 'العناية بالشعر', 'شامبو', 5, IMG.hair, 4.5, 203, false],
  ['Dove Nourishing Oil Shampoo 600ml', 'شامبو دوف بزيوت مغذية للعناية بالشعر.', 164.20, undefined, 'العناية بالشعر', 'شامبو', 6, IMG.hair, 4.6, 74, false],
  ['Eva Optimum Care Hydrating Blend Shampoo 350ml', 'شامبو إيفا بتركيبة مرطبة.', 113.50, 126, 'العناية بالشعر', 'شامبو', 7, IMG.hair, 4.2, 102, false],
  ['Eva Optimum Care Silk & Shine Shampoo 350ml', 'شامبو إيفا للعناية واللمعان.', 107.99, 126, 'العناية بالشعر', 'شامبو', 8, IMG.hair, 4.4, 75, false],
  ['NIZAPEX Shampoo 80ml', 'شامبو نيزابيكس بحجم 80 مل.', 72.90, 85, 'العناية بالشعر', 'شامبو علاجي', 9, IMG.hair, 4.3, 150, false],
  ['Penduline Kids Hair Care Shampoo 450ml', 'شامبو بندولين للأطفال.', 192.99, 210, 'الأطفال', 'شامبو أطفال', 1, IMG.baby, 4.5, 798, true],
  ['Dove Intensive Repair Conditioner 350ml', 'بلسم دوف للعناية بالشعر المتضرر.', 104, 160, 'العناية بالشعر', 'بلسم', 10, IMG.hair, 4.3, 336, false],
  ['Aloe Eva Hair Mask 250ml', 'ماسك شعر بالألوفيرا وبروتينات الزبادي.', 74, undefined, 'العناية بالشعر', 'ماسكات الشعر', 11, IMG.hair, 4.4, 374, false],

  // Deodorants / body care
  ['Axe Body Spray Ice Chill 150ml', 'بخاخ أكس آيس تشيل للرجال.', 129, undefined, 'مزيلات العرق', 'بخاخ', 1, IMG.body, 4.5, 867, true],
  ['NIVEA Invisible Black & White Deodorant Spray Women 150ml', 'مزيل عرق نيفيا إنفيزيبل بلاك آند وايت للنساء.', 124.95, undefined, 'مزيلات العرق', 'بخاخ', 2, IMG.body, 4.4, 1220, true],
  ['Axe Body Spray Black Night 150ml', 'بخاخ أكس بلاك نايت للرجال.', 158.95, undefined, 'مزيلات العرق', 'بخاخ', 3, IMG.body, 4.5, 528, false],
  ['NIVEA MEN Cool Kick Deodorant Spray 150ml', 'مزيل عرق نيفيا مين كول كيك.', 124.95, undefined, 'مزيلات العرق', 'بخاخ', 4, IMG.body, 4.4, 628, false],
  ['NIVEA Black & White Invisible Roll-On 50ml', 'رول أون نيفيا بلاك آند وايت.', 69.95, undefined, 'مزيلات العرق', 'رول أون', 5, IMG.body, 4.5, 408, false],
  ['Eva Foot Powder with Aloe Vera 50g', 'بودرة إيفا للقدمين بخلاصة الألوفيرا.', 42, undefined, 'العناية الشخصية', 'العناية بالقدمين', 1, IMG.body, 4.4, 146, false],
  ['Starville Whitening Roll-On 60ml', 'رول أون ستارفيل للتفتيح بدون عطر.', 109.20, 135, 'مزيلات العرق', 'رول أون', 6, IMG.body, 4.1, 155, false],
  ['Old Spice Nomad No Gas Body Spray 140ml', 'بخاخ أولد سبايس نوماد بدون غاز.', 330, undefined, 'مزيلات العرق', 'بخاخ', 7, IMG.body, 3.9, 2393, false],
  ['FOGG Masters Body Spray Cedar', 'بخاخ فوج ماسترز سيدار للرجال.', 97.95, undefined, 'مزيلات العرق', 'بخاخ', 8, IMG.body, 4.1, 172, false],
  ['FOGG Absolute Roll-On 50ml', 'رول أون فوج أبسولوت للرجال.', 50, 55, 'مزيلات العرق', 'رول أون', 9, IMG.body, 4.1, 418, false],
  ['NIVEA Nourishing Body Milk 400ml', 'لوشن نيفيا اليومي للبشرة الجافة.', 295, undefined, 'العناية بالجسم', 'لوشن', 1, IMG.body, 0, 0, false],
  ['Vaseline Intensive Care Advanced Repair Lotion 400ml', 'لوشن فازلين للبشرة شديدة الجفاف.', 310, undefined, 'العناية بالجسم', 'لوشن', 2, IMG.body, 0, 0, false],
  ['Dove Deeply Nourishing Body Wash 500ml', 'غسول جسم مرطب للاستخدام اليومي.', 235, undefined, 'العناية بالجسم', 'غسول الجسم', 3, IMG.body, 0, 0, false],

  // Skin care
  ['CeraVe Moisturising Cream 177ml', 'كريم سيرافي المرطب للوجه والجسم للبشرة الجافة.', 506.92, undefined, 'العناية بالبشرة', 'مرطبات', 1, IMG.skin, 0, 0, true],
  ['CeraVe Moisturising Cream 454g', 'كريم سيرافي المرطب للوجه والجسم بحجم 454 جم.', 950, undefined, 'العناية بالبشرة', 'مرطبات', 2, IMG.skin, 0, 0, false],
  ['CeraVe Hydrating Cleanser 236ml', 'غسول سيرافي المرطب للبشرة العادية إلى الجافة.', 567.97, undefined, 'العناية بالبشرة', 'غسول', 3, IMG.skin, 0, 0, true],
  ['CeraVe Facial Moisturising Lotion SPF25 52ml', 'لوشن سيرافي للوجه مع حماية SPF25.', 525, 575, 'العناية بالبشرة', 'مرطبات وواقي شمس', 4, IMG.skin, 0, 0, false],
  ['CeraVe Renewing SA Cleanser 473ml', 'غسول سيرافي SA للبشرة العادية.', 1199, undefined, 'العناية بالبشرة', 'غسول', 5, IMG.skin, 0, 0, false],
  ['CeraVe SA Smoothing Cream 177ml', 'كريم سيرافي SA للبشرة الجافة والخشنة.', 780, undefined, 'العناية بالبشرة', 'مرطبات', 6, IMG.skin, 0, 0, false],
  ['Garnier SkinActive Vitamin C Serum 30ml', 'سيروم فيتامين C للعناية بمظهر البشرة وتوحيد اللون.', 395, undefined, 'العناية بالبشرة', 'سيروم', 7, IMG.skin, 0, 0, false],
  ['NIVEA Soft Moisturizing Cream 200ml', 'كريم نيفيا سوفت المرطب للاستخدام اليومي.', 185, undefined, 'العناية بالبشرة', 'مرطبات', 8, IMG.skin, 0, 0, false],
  ['La Roche-Posay Effaclar Purifying Foaming Gel 200ml', 'غسول منظف للبشرة الدهنية والمعرضة للحبوب.', 780, undefined, 'العناية بالبشرة', 'غسول', 9, IMG.skin, 0, 0, false],

  // Sunscreen
  ['La Roche-Posay Anthelios UVMune 400 SPF50+ Fluid 50ml', 'واقي شمس عالي الحماية للوجه.', 980, undefined, 'واقي الشمس', 'SPF50+', 1, IMG.sun, 0, 0, true],
  ['NIVEA Sun Protect & Moisture SPF50 200ml', 'واقي شمس عالي الحماية للوجه والجسم.', 520, undefined, 'واقي الشمس', 'SPF50+', 2, IMG.sun, 0, 0, true],
  ['Garnier Ambre Solaire Super UV SPF50+ Fluid 40ml', 'واقي شمس خفيف للوجه.', 450, undefined, 'واقي الشمس', 'واقي شمس للوجه', 3, IMG.sun, 0, 0, false],
  ['Eva Skin Clinic Sun Block SPF50+ 50ml', 'واقي شمس يومي للوجه.', 240, undefined, 'واقي الشمس', 'واقي شمس للوجه', 4, IMG.sun, 0, 0, false],

  // Oral care
  ['Sensodyne Repair & Protect Toothpaste 75ml', 'معجون أسنان للعناية اليومية بالأسنان الحساسة.', 185, undefined, 'العناية بالفم والأسنان', 'معجون أسنان', 1, IMG.dental, 0, 0, true],
  ['Colgate Total Original Toothpaste 100ml', 'معجون أسنان للاستخدام اليومي.', 95, undefined, 'العناية بالفم والأسنان', 'معجون أسنان', 2, IMG.dental, 0, 0, true],
  ['Oral-B Pro-Expert Toothpaste 75ml', 'معجون أسنان للعناية الشاملة بالفم.', 120, undefined, 'العناية بالفم والأسنان', 'معجون أسنان', 3, IMG.dental, 0, 0, false],
  ['Listerine Cool Mint Mouthwash 500ml', 'غسول فم للاستخدام اليومي.', 260, undefined, 'العناية بالفم والأسنان', 'غسول فم', 4, IMG.dental, 0, 0, false],

  // Baby care
  ['Johnson’s Baby Shampoo 500ml', 'شامبو لطيف للأطفال.', 220, undefined, 'الأطفال', 'شامبو أطفال', 2, IMG.baby, 0, 0, true],
  ['Johnson’s Baby Lotion 500ml', 'لوشن لطيف لبشرة الأطفال.', 235, undefined, 'الأطفال', 'لوشن أطفال', 3, IMG.baby, 0, 0, false],
  ['Sebamed Baby Cleansing Bar 100g', 'منظف لطيف للبشرة الحساسة للأطفال.', 180, undefined, 'الأطفال', 'عناية أطفال', 4, IMG.baby, 0, 0, false],
];

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
  await mongoose.connect(process.env.MONGODB_URI);

  for (const [name, description, price, originalPrice, category, subCategory, popularityRank, image, averageRating, reviewsCount, featured] of products as any[]) {
    const doc: any = {
      name,
      description,
      price,
      image,
      images: [image],
      category,
      subCategory,
      stock: 25,
      featured,
      active: true,
      averageRating,
      reviewsCount,
      popularityRank,
      sizes: [],
      colors: [],
    };
    if (originalPrice) doc.originalPrice = originalPrice;

    await Product.updateOne({ name }, { $set: doc }, { upsert: true });
  }

  console.log(`Seeded/updated ${products.length} products.`);
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Product seed failed:', error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});
