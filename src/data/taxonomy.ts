export interface SubCategoryItem {
  id: string;
  nameAr: string;
  nameEn: string;
  slug: string;
}

export interface MainCategoryItem {
  id: string;
  number: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  icon: string;
  subcategories: SubCategoryItem[];
  popularConcerns?: string[];
}

export const MAIN_CATEGORIES: MainCategoryItem[] = [
  {
    id: 'hair-care',
    number: '01',
    nameAr: 'العناية بالشعر',
    nameEn: 'Hair Care',
    slug: 'hair-care',
    icon: '',
    subcategories: [
      { id: 'shampoo', nameAr: 'شامبو', nameEn: 'Shampoo', slug: 'shampoo' },
      { id: 'conditioner', nameAr: 'بلسم', nameEn: 'Conditioner', slug: 'conditioner' },
      { id: 'hair-mask', nameAr: 'ماسك الشعر وحمام كريم', nameEn: 'Hair Mask', slug: 'hair-mask' },
      { id: 'hair-cream', nameAr: 'كريم الشعر', nameEn: 'Hair Cream', slug: 'hair-cream' },
      { id: 'hair-oil', nameAr: 'زيت الشعر', nameEn: 'Hair Oil', slug: 'hair-oil' },
      { id: 'hair-serum', nameAr: 'سيروم الشعر', nameEn: 'Hair Serum', slug: 'hair-serum' },
      { id: 'leave-in', nameAr: 'ليف إن كريم', nameEn: 'Leave-in', slug: 'leave-in' },
      { id: 'hair-treatment', nameAr: 'علاجات الشعر التالف', nameEn: 'Hair Treatment', slug: 'hair-treatment' },
      { id: 'anti-dandruff', nameAr: 'مضاد للقشرة', nameEn: 'Anti-Dandruff', slug: 'anti-dandruff' },
      { id: 'hair-loss', nameAr: 'تساقط الشعر وتقويته', nameEn: 'Hair Loss', slug: 'hair-loss' },
      { id: 'hair-styling', nameAr: 'تصفيف وتثبيت الشعر', nameEn: 'Hair Styling', slug: 'hair-styling' },
      { id: 'hair-color', nameAr: 'صبغات الشعر', nameEn: 'Hair Color', slug: 'hair-color' },
      { id: 'keratin-protein', nameAr: 'كيراتين وبروتين', nameEn: 'Keratin & Protein', slug: 'keratin-protein' },
      { id: 'hair-brushes-combs', nameAr: 'فرش وأمشاط الشعر', nameEn: 'Hair Brushes & Combs', slug: 'hair-brushes-combs' },
      { id: 'hair-accessories', nameAr: 'إكسسوارات الشعر', nameEn: 'Hair Accessories', slug: 'hair-accessories' }
    ],
    popularConcerns: ['تساقط الشعر', 'القشرة', 'الهيشان والجفاف', 'تلف الصبغة والحرارة', 'تكثيف الشعر']
  },
  {
    id: 'skin-care',
    number: '02',
    nameAr: 'العناية بالبشرة',
    nameEn: 'Skin Care',
    slug: 'skin-care',
    icon: '',
    subcategories: [
      { id: 'face-wash', nameAr: 'غسول الوجه', nameEn: 'Face Wash', slug: 'face-wash' },
      { id: 'cleanser', nameAr: 'منظف البشرة', nameEn: 'Cleanser', slug: 'cleanser' },
      { id: 'toner', nameAr: 'تونر وقابض للمسام', nameEn: 'Toner', slug: 'toner' },
      { id: 'moisturizer', nameAr: 'مرطب الوجه', nameEn: 'Moisturizer', slug: 'moisturizer' },
      { id: 'serum', nameAr: 'سيروم النضارة والترطيب', nameEn: 'Serum', slug: 'serum' },
      { id: 'acne-care', nameAr: 'علاج حب الشباب', nameEn: 'Acne Care', slug: 'acne-care' },
      { id: 'pigmentation', nameAr: 'تفتيح وتوحيد اللون', nameEn: 'Pigmentation', slug: 'pigmentation' },
      { id: 'anti-aging', nameAr: 'مكافحة التجاعيد وعلامات التقدم', nameEn: 'Anti-Aging', slug: 'anti-aging' },
      { id: 'face-mask', nameAr: 'ماسك الوجه وشيت ماسك', nameEn: 'Face Mask', slug: 'face-mask' },
      { id: 'face-scrub', nameAr: 'مقشر وسكراب الوجه', nameEn: 'Face Scrub', slug: 'face-scrub' },
      { id: 'micellar-water', nameAr: 'ماء ميسيلار', nameEn: 'Micellar Water', slug: 'micellar-water' },
      { id: 'makeup-remover', nameAr: 'مزيل المكياج', nameEn: 'Makeup Remover', slug: 'makeup-remover' },
      { id: 'eye-care', nameAr: 'العناية بمحيط العين', nameEn: 'Eye Care', slug: 'eye-care' },
      { id: 'lip-care', nameAr: 'مرطب ومقشر الشفاه', nameEn: 'Lip Care', slug: 'lip-care' }
    ],
    popularConcerns: ['حب الشباب', 'التصبغات والبقع', 'جفاف البشرة', 'المسام الواسعة', 'الهالات السوداء']
  },
  {
    id: 'body-care',
    number: '03',
    nameAr: 'العناية بالجسم',
    nameEn: 'Body Care',
    slug: 'body-care',
    icon: '',
    subcategories: [
      { id: 'body-splash', nameAr: 'بادي سبلاش ومعطر', nameEn: 'Body Splash', slug: 'body-splash' },
      { id: 'body-mist', nameAr: 'بادي ميست فاخر', nameEn: 'Body Mist', slug: 'body-mist' },
      { id: 'body-lotion', nameAr: 'لوشن ترطيب الجسم', nameEn: 'Body Lotion', slug: 'body-lotion' },
      { id: 'body-cream', nameAr: 'كريم ترطيب مكثف', nameEn: 'Body Cream', slug: 'body-cream' },
      { id: 'body-butter', nameAr: 'زبدة الجسم الطبيعية', nameEn: 'Body Butter', slug: 'body-butter' },
      { id: 'body-scrub', nameAr: 'مقشر وسكراب الجسم', nameEn: 'Body Scrub', slug: 'body-scrub' },
      { id: 'shower-gel', nameAr: 'شاور جل وجل استحمام', nameEn: 'Shower Gel', slug: 'shower-gel' },
      { id: 'body-wash', nameAr: 'غسول الجسم المرطب', nameEn: 'Body Wash', slug: 'body-wash' },
      { id: 'hand-cream', nameAr: 'كريم اليدين والأظافر', nameEn: 'Hand Cream', slug: 'hand-cream' },
      { id: 'foot-cream', nameAr: 'كريم تشققات وترطيب القدمين', nameEn: 'Foot Cream', slug: 'foot-cream' },
      { id: 'body-soap', nameAr: 'صابون طبيعي ومغذي', nameEn: 'Body Soap', slug: 'body-soap' }
    ]
  },
  {
    id: 'deodorants',
    number: '04',
    nameAr: 'مزيلات العرق',
    nameEn: 'Deodorants',
    slug: 'deodorants',
    icon: '',
    subcategories: [
      { id: 'roll-on', nameAr: 'رول أون مزيل عرق', nameEn: 'Roll On', slug: 'roll-on' },
      { id: 'spray', nameAr: 'بخاخ مزيل رائحة العرق', nameEn: 'Spray', slug: 'spray' },
      { id: 'stick', nameAr: 'ستيك مزيل عرق صلب', nameEn: 'Stick', slug: 'stick' },
      { id: 'cream', nameAr: 'كريم مزيل العرق', nameEn: 'Cream', slug: 'cream' },
      { id: 'men', nameAr: 'مزيلات عرق للرجال', nameEn: 'Men', slug: 'men' },
      { id: 'women', nameAr: 'مزيلات عرق للنساء', nameEn: 'Women', slug: 'women' }
    ]
  },
  {
    id: 'sunscreen',
    number: '05',
    nameAr: 'واقي الشمس',
    nameEn: 'Sunscreen',
    slug: 'sunscreen',
    icon: '',
    subcategories: [
      { id: 'face-sunscreen', nameAr: 'صن بلوك للوجه', nameEn: 'Face Sunscreen', slug: 'face-sunscreen' },
      { id: 'body-sunscreen', nameAr: 'صن بلوك للجسم', nameEn: 'Body Sunscreen', slug: 'body-sunscreen' },
      { id: 'oily-skin', nameAr: 'واقي شمس للبشرة الدهنية (جل/فلويد)', nameEn: 'Oily Skin', slug: 'oily-skin' },
      { id: 'dry-skin', nameAr: 'واقي شمس للبشرة الجافة (كريم)', nameEn: 'Dry Skin', slug: 'dry-skin' },
      { id: 'sensitive-skin', nameAr: 'واقي شمس للبشرة الحساسة', nameEn: 'Sensitive Skin', slug: 'sensitive-skin' },
      { id: 'kids', nameAr: 'واقي شمس مخصص للأطفال', nameEn: 'Kids', slug: 'kids' },
      { id: 'spf-30', nameAr: 'حماية SPF 30', nameEn: 'SPF 30', slug: 'spf-30' },
      { id: 'spf-50-plus', nameAr: 'حماية فائقة SPF 50+', nameEn: 'SPF 50+', slug: 'spf-50-plus' }
    ]
  },
  {
    id: 'makeup',
    number: '06',
    nameAr: 'المكياج ومستحضرات التجميل',
    nameEn: 'Makeup',
    slug: 'makeup',
    icon: '',
    subcategories: [
      { id: 'foundation', nameAr: 'كريم أساس وفونديشن', nameEn: 'Foundation', slug: 'foundation' },
      { id: 'concealer', nameAr: 'كونسيلر وخافي عيوب', nameEn: 'Concealer', slug: 'concealer' },
      { id: 'powder', nameAr: 'بودرة مضغوطة ولوز باودر', nameEn: 'Powder', slug: 'powder' },
      { id: 'blush', nameAr: 'بلاشر وأحمر خدود', nameEn: 'Blush', slug: 'blush' },
      { id: 'bronzer', nameAr: 'برونزر وتسمير', nameEn: 'Bronzer', slug: 'bronzer' },
      { id: 'contour', nameAr: 'كونتور ونحت الوجه', nameEn: 'Contour', slug: 'contour' },
      { id: 'highlighter', nameAr: 'هايلايتر وإضاءة', nameEn: 'Highlighter', slug: 'highlighter' },
      { id: 'primer', nameAr: 'برايمر مثبت مكياج', nameEn: 'Primer', slug: 'primer' },
      { id: 'setting-spray', nameAr: 'سبراي تثبيت المكياج', nameEn: 'Setting Spray', slug: 'setting-spray' },
      { id: 'mascara', nameAr: 'ماسكارا تطويل وتكثيف', nameEn: 'Mascara', slug: 'mascara' },
      { id: 'eyeliner', nameAr: 'آيلاينر ومحدد عيون', nameEn: 'Eyeliner', slug: 'eyeliner' },
      { id: 'eyeshadow', nameAr: 'ظلال عيون وآيشادو', nameEn: 'Eyeshadow', slug: 'eyeshadow' },
      { id: 'eyebrow', nameAr: 'محدد وماسكارا حواجب', nameEn: 'Eyebrow', slug: 'eyebrow' },
      { id: 'lipstick', nameAr: 'أحمر شفاه وروج مات وكريمي', nameEn: 'Lipstick', slug: 'lipstick' },
      { id: 'lip-gloss', nameAr: 'ملمع شفاه ليب جلوس', nameEn: 'Lip Gloss', slug: 'lip-gloss' },
      { id: 'lip-tint', nameAr: 'ليب تينت ثابت', nameEn: 'Lip Tint', slug: 'lip-tint' },
      { id: 'lip-liner', nameAr: 'قلم تحديد الشفاه', nameEn: 'Lip Liner', slug: 'lip-liner' },
      { id: 'makeup-remover', nameAr: 'مزيل مكياج وميسيلار', nameEn: 'Makeup Remover', slug: 'makeup-remover' },
      { id: 'makeup-brushes', nameAr: 'فرش المكياج الاحترافية', nameEn: 'Makeup Brushes', slug: 'makeup-brushes' },
      { id: 'beauty-blender', nameAr: 'بيوتي بلندر وإسفنج دمج', nameEn: 'Beauty Blender', slug: 'beauty-blender' }
    ]
  },
  {
    id: 'perfumes',
    number: '07',
    nameAr: 'العطور الفاخرة',
    nameEn: 'Perfumes',
    slug: 'perfumes',
    icon: '',
    subcategories: [
      { id: 'womens-perfume', nameAr: 'عطور حريمي', nameEn: "Women's Perfume", slug: 'womens-perfume' },
      { id: 'mens-perfume', nameAr: 'عطور رجالي', nameEn: "Men's Perfume", slug: 'mens-perfume' },
      { id: 'unisex', nameAr: 'عطور للجنسين', nameEn: 'Unisex', slug: 'unisex' },
      { id: 'body-mist', nameAr: 'بودي ميست فاخر', nameEn: 'Body Mist', slug: 'body-mist' },
      { id: 'body-splash', nameAr: 'بودي سبلاش منعش', nameEn: 'Body Splash', slug: 'body-splash' },
      { id: 'hair-mist', nameAr: 'معطر شعر هير ميست', nameEn: 'Hair Mist', slug: 'hair-mist' },
      { id: 'perfume-oils', nameAr: 'زيوت عطرية ومسك', nameEn: 'Perfume Oils', slug: 'perfume-oils' },
      { id: 'mini-perfumes', nameAr: 'ميني بارفيوم وترافل سايز', nameEn: 'Mini Perfumes', slug: 'mini-perfumes' },
      { id: 'gift-sets', nameAr: 'مجموعات هدايا وبوكسات عطور', nameEn: 'Gift Sets', slug: 'gift-sets' }
    ]
  },
  {
    id: 'men-care',
    number: '08',
    nameAr: 'العناية بالرجال',
    nameEn: 'Men Care',
    slug: 'men-care',
    icon: '',
    subcategories: [
      { id: 'mens-shampoo', nameAr: 'شامبو رجالي ومضاد قشرة', nameEn: "Men's Shampoo", slug: 'mens-shampoo' },
      { id: 'face-wash', nameAr: 'غسول وجه للرجال', nameEn: 'Face Wash', slug: 'face-wash' },
      { id: 'moisturizer', nameAr: 'مرطب بشرة للرجال', nameEn: 'Moisturizer', slug: 'moisturizer' },
      { id: 'deodorant', nameAr: 'مزيل عرق للرجال', nameEn: 'Deodorant', slug: 'deodorant' },
      { id: 'perfume', nameAr: 'عطور رجالية جذابة', nameEn: 'Perfume', slug: 'perfume' },
      { id: 'beard-oil', nameAr: 'زيت تغذية وإنبات اللحية', nameEn: 'Beard Oil', slug: 'beard-oil' },
      { id: 'beard-balm', nameAr: 'بلسم وتهذيب اللحية', nameEn: 'Beard Balm', slug: 'beard-balm' },
      { id: 'beard-shampoo', nameAr: 'شامبو وغسول اللحية', nameEn: 'Beard Shampoo', slug: 'beard-shampoo' },
      { id: 'after-shave', nameAr: 'أفتر شيف ومهدئ بعد الحلاقة', nameEn: 'After Shave', slug: 'after-shave' },
      { id: 'shaving-foam', nameAr: 'فوم وجل الحلاقة', nameEn: 'Shaving Foam', slug: 'shaving-foam' },
      { id: 'razors', nameAr: 'شفرات وماكينات الحلاقة', nameEn: 'Razors', slug: 'razors' },
      { id: 'hair-styling', nameAr: 'جل وجاك وواكس الشعر', nameEn: 'Hair Styling', slug: 'hair-styling' }
    ]
  },
  {
    id: 'oral-care',
    number: '09',
    nameAr: 'العناية بالفم والأسنان',
    nameEn: 'Oral Care',
    slug: 'oral-care',
    icon: '',
    subcategories: [
      { id: 'toothpaste', nameAr: 'معجون أسنان', nameEn: 'Toothpaste', slug: 'toothpaste' },
      { id: 'toothbrush', nameAr: 'فرش أسنان يدوية وكهربائية', nameEn: 'Toothbrush', slug: 'toothbrush' },
      { id: 'mouthwash', nameAr: 'غسول فم ومطهر', nameEn: 'Mouthwash', slug: 'mouthwash' },
      { id: 'dental-floss', nameAr: 'خيط أسنان طبي', nameEn: 'Dental Floss', slug: 'dental-floss' },
      { id: 'whitening', nameAr: 'تبييض الأسنان', nameEn: 'Whitening', slug: 'whitening' },
      { id: 'gum-care', nameAr: 'العناية باللثة الحساسة', nameEn: 'Gum Care', slug: 'gum-care' }
    ]
  },
  {
    id: 'baby-care',
    number: '10',
    nameAr: 'منتجات الأطفال',
    nameEn: 'Baby Care',
    slug: 'baby-care',
    icon: '',
    subcategories: [
      { id: 'baby-shampoo', nameAr: 'شامبو أطفال لا دموع بعد اليوم', nameEn: 'Baby Shampoo', slug: 'baby-shampoo' },
      { id: 'baby-body-wash', nameAr: 'شاور وغسول جسم للأطفال', nameEn: 'Baby Body Wash', slug: 'baby-body-wash' },
      { id: 'baby-lotion', nameAr: 'لوشن ترطيب الأطفال', nameEn: 'Baby Lotion', slug: 'baby-lotion' },
      { id: 'baby-oil', nameAr: 'زيت تدليك وترطيب البيبي', nameEn: 'Baby Oil', slug: 'baby-oil' },
      { id: 'baby-cream', nameAr: 'كريم الحفاض والتهيج', nameEn: 'Baby Cream', slug: 'baby-cream' },
      { id: 'baby-sunscreen', nameAr: 'صن بلوك الأطفال', nameEn: 'Baby Sunscreen', slug: 'baby-sunscreen' },
      { id: 'baby-wipes', nameAr: 'مناديل مبللة نقية', nameEn: 'Baby Wipes', slug: 'baby-wipes' }
    ]
  },
  {
    id: 'nails',
    number: '11',
    nameAr: 'الأظافر والمناكير',
    nameEn: 'Nails',
    slug: 'nails',
    icon: '',
    subcategories: [
      { id: 'nail-polish', nameAr: 'طلاء أظافر مناكير', nameEn: 'Nail Polish', slug: 'nail-polish' },
      { id: 'gel-polish', nameAr: 'جيل بولش ثابت', nameEn: 'Gel Polish', slug: 'gel-polish' },
      { id: 'nail-remover', nameAr: 'مزيل طلاء أظافر أسيتون وبدون أسيتون', nameEn: 'Nail Remover', slug: 'nail-remover' },
      { id: 'nail-treatment', nameAr: 'مقوي وعلاج تكسر الأظافر', nameEn: 'Nail Treatment', slug: 'nail-treatment' },
      { id: 'nail-tools', nameAr: 'أدوات العناية بالأظافر', nameEn: 'Nail Tools', slug: 'nail-tools' },
      { id: 'nail-files', nameAr: 'مبارد أظافر ناعمة وخشنة', nameEn: 'Nail Files', slug: 'nail-files' },
      { id: 'nail-clippers', nameAr: 'قصافات ومقصات أظافر', nameEn: 'Nail Clippers', slug: 'nail-clippers' },
      { id: 'manicure-pedicure', nameAr: 'مجموعات مانيكير وباديكير', nameEn: 'Manicure & Pedicure', slug: 'manicure-pedicure' }
    ]
  },
  {
    id: 'beauty-tools',
    number: '12',
    nameAr: 'أدوات ومستلزمات التجميل',
    nameEn: 'Beauty Tools',
    slug: 'beauty-tools',
    icon: '',
    subcategories: [
      { id: 'makeup-brushes', nameAr: 'فرش المكياج', nameEn: 'Makeup Brushes', slug: 'makeup-brushes' },
      { id: 'beauty-blender', nameAr: 'بيوتي بلندر وإسفنجات', nameEn: 'Beauty Blender', slug: 'beauty-blender' },
      { id: 'makeup-bags', nameAr: 'حقائب ومحافظ المكياج', nameEn: 'Makeup Bags', slug: 'makeup-bags' },
      { id: 'mirrors', nameAr: 'مرايا مكبرة ومضيئة', nameEn: 'Mirrors', slug: 'mirrors' },
      { id: 'hair-brushes', nameAr: 'فرش الشعر الحرارية والخشبية', nameEn: 'Hair Brushes', slug: 'hair-brushes' },
      { id: 'combs', nameAr: 'أمشاط تسليك وفك تشابك', nameEn: 'Combs', slug: 'combs' },
      { id: 'hair-clips', nameAr: 'بنس وتوك ومقابض الشعر', nameEn: 'Hair Clips', slug: 'hair-clips' },
      { id: 'hair-bands', nameAr: 'أطواق وربطات الشعر', nameEn: 'Hair Bands', slug: 'hair-bands' },
      { id: 'tweezers', nameAr: 'ملاقيط دقيقة', nameEn: 'Tweezers', slug: 'tweezers' },
      { id: 'lash-curler', nameAr: 'مكبس ومثني الرموش', nameEn: 'Lash Curler', slug: 'lash-curler' },
      { id: 'gua-sha', nameAr: 'حجر جوا شا ومساج الوجه', nameEn: 'Gua Sha', slug: 'gua-sha' },
      { id: 'facial-tools', nameAr: 'ديرما رولر وأجهزة تنظيف الوجه', nameEn: 'Facial Tools', slug: 'facial-tools' }
    ]
  },
  {
    id: 'hair-removal',
    number: '13',
    nameAr: 'إزالة الشعر',
    nameEn: 'Hair Removal',
    slug: 'hair-removal',
    icon: '',
    subcategories: [
      { id: 'razors', nameAr: 'شفرات حلاقة نسائية ورجالية', nameEn: 'Razors', slug: 'razors' },
      { id: 'wax', nameAr: 'شمع حار وبارد', nameEn: 'Wax', slug: 'wax' },
      { id: 'wax-strips', nameAr: 'شرائح شمع جاهزة', nameEn: 'Wax Strips', slug: 'wax-strips' },
      { id: 'hair-removal-cream', nameAr: 'كريم إزالة الشعر للبشرة الحساسة', nameEn: 'Hair Removal Cream', slug: 'hair-removal-cream' },
      { id: 'tweezers', nameAr: 'ملاقيط إزالة الشعر الدقيق', nameEn: 'Tweezers', slug: 'tweezers' },
      { id: 'after-wax-care', nameAr: 'زيوت ومهدئات بعد إزالة الشعر', nameEn: 'After Wax Care', slug: 'after-wax-care' }
    ]
  },
  {
    id: 'dermocosmetics',
    number: '14',
    nameAr: 'مستحضرات العناية الطبية',
    nameEn: 'Dermocosmetics',
    slug: 'dermocosmetics',
    icon: '',
    subcategories: [
      { id: 'acne', nameAr: 'علاج حب الشباب وآثاره الطبي', nameEn: 'Acne', slug: 'acne' },
      { id: 'pigmentation', nameAr: 'تفتيح الكلف والتصبغات المستعصية', nameEn: 'Pigmentation', slug: 'pigmentation' },
      { id: 'anti-aging', nameAr: 'سيرومات الرينول والهيالورونيك الطبي', nameEn: 'Anti-Aging', slug: 'anti-aging' },
      { id: 'sensitive-skin', nameAr: 'تهدئة الأكزيما والوردية للبشرة الحساسة', nameEn: 'Sensitive Skin', slug: 'sensitive-skin' },
      { id: 'dry-skin', nameAr: 'ترطيب عميق لحاجز البشرة التالف (سيراميد)', nameEn: 'Dry Skin', slug: 'dry-skin' },
      { id: 'oily-skin', nameAr: 'تنظيم إفراز الدهون وتضييق المسام', nameEn: 'Oily Skin', slug: 'oily-skin' },
      { id: 'hair-loss', nameAr: 'أمبولات ولوشنات علاج الصلع الوراثي والتساقط', nameEn: 'Hair Loss', slug: 'hair-loss' },
      { id: 'dandruff', nameAr: 'علاج القشرة الدهنية والصدفية', nameEn: 'Dandruff', slug: 'dandruff' },
      { id: 'scar-care', nameAr: 'جل وكريمات علاج الندبات والجروح', nameEn: 'Scar Care', slug: 'scar-care' },
      { id: 'lip-care', nameAr: 'مرمم الشفاه المتشققة الطبي', nameEn: 'Lip Care', slug: 'lip-care' },
      { id: 'hand-foot-care', nameAr: 'يوريا وكريمات ترميم اليدين والقدمين', nameEn: 'Hand & Foot Care', slug: 'hand-foot-care' }
    ]
  }
];

export interface BrandItem {
  id: string;
  nameAr: string;
  nameEn: string;
  country: string;
  categories: string[];
  popularProducts: string;
  isPopularInEgypt: boolean;
}

export const POPULAR_BRANDS: BrandItem[] = [
  { id: 'head-and-shoulders', nameAr: 'هيد آند شولدرز', nameEn: 'Head & Shoulders', country: 'Global / Egypt', categories: ['العناية بالشعر', 'العناية بالرجال'], popularProducts: 'Classic Clean, Menthol, Smooth & Silky', isPopularInEgypt: true },
  { id: 'pantene', nameAr: 'بانتين', nameEn: 'Pantene', country: 'Global / Egypt', categories: ['العناية بالشعر'], popularProducts: 'Milky Damage Repair, Oil Replacement, Anti Hair Fall', isPopularInEgypt: true },
  { id: 'sunsilk', nameAr: 'صانسيلك', nameEn: 'Sunsilk', country: 'Global / Egypt', categories: ['العناية بالشعر'], popularProducts: 'Thick & Long, Black Shine, Soft & Smooth', isPopularInEgypt: true },
  { id: 'dove', nameAr: 'دوف', nameEn: 'Dove', country: 'Global / Egypt', categories: ['العناية بالجسم', 'العناية بالبشرة', 'مزيلات العرق', 'العناية بالشعر'], popularProducts: 'Deeply Nourishing Body Wash, Original Deodorant, Beauty Bar', isPopularInEgypt: true },
  { id: 'loreal-paris', nameAr: 'لوريال باريس', nameEn: "L'Oréal Paris", country: 'France / Egypt', categories: ['العناية بالبشرة', 'العناية بالشعر', 'المكياج'], popularProducts: 'Hyaluron Expert Serum, Elseve Total Repair 5, Telescopic Mascara', isPopularInEgypt: true },
  { id: 'garnier', nameAr: 'غارنييه', nameEn: 'Garnier', country: 'France / Egypt', categories: ['العناية بالبشرة', 'العناية بالشعر'], popularProducts: 'Micellar Cleansing Water, Fast Bright Vitamin C Serum, Fructis', isPopularInEgypt: true },
  { id: 'clear', nameAr: 'كلير', nameEn: 'Clear', country: 'Global / Egypt', categories: ['العناية بالشعر', 'العناية بالرجال'], popularProducts: 'Cool Sport Menthol Shampoo, Anti-Dandruff Active', isPopularInEgypt: true },
  { id: 'herbal-essences', nameAr: 'هيربل إيسنسز', nameEn: 'Herbal Essences', country: 'Global / Egypt', categories: ['العناية بالشعر'], popularProducts: 'Argan Oil of Morocco, Bio:Renew Coconut Milk', isPopularInEgypt: true },
  { id: 'vatika', nameAr: 'فاتيكا', nameEn: 'Vatika', country: 'Dabur / Egypt', categories: ['العناية بالشعر'], popularProducts: 'Garlic Hair Oil, Enriched Olive Mask, Egg Protein Conditioner', isPopularInEgypt: true },
  { id: 'nivea', nameAr: 'نيفيا', nameEn: 'Nivea', country: 'Germany / Egypt', categories: ['العناية بالبشرة', 'العناية بالجسم', 'مزيلات العرق', 'واقي الشمس', 'العناية بالرجال'], popularProducts: 'Nivea Soft, Black & White Invisible, Sun Protect SPF 50+', isPopularInEgypt: true },
  { id: 'rexona', nameAr: 'ريكسونا', nameEn: 'Rexona', country: 'Global / Egypt', categories: ['مزيلات العرق', 'العناية بالرجال'], popularProducts: 'MotionSense Antibacterial, Cobalt Dry Men Spray', isPopularInEgypt: true },
  { id: 'eva-cosmetics', nameAr: 'إيفا كوزماتيكس', nameEn: 'Eva Cosmetics', country: 'Egypt', categories: ['العناية بالبشرة', 'العناية بالشعر', 'العناية بالجسم'], popularProducts: 'Aloe Eva Hair Mask, Eva Collagen Cream, B-White, Skin Clinic', isPopularInEgypt: true },
  { id: 'himalaya', nameAr: 'هيمالايا', nameEn: 'Himalaya', country: 'Global / Egypt', categories: ['العناية بالبشرة', 'العناية بالشعر', 'العناية بالفم والأسنان'], popularProducts: 'Purifying Neem Face Wash, Gentle Exfoliating Walnut Scrub', isPopularInEgypt: true },
  { id: 'maybelline', nameAr: 'ميبلين نيويورك', nameEn: 'Maybelline New York', country: 'USA / Egypt', categories: ['المكياج'], popularProducts: 'Sky High Mascara, Fit Me Matte+Poreless, Instant Eraser Concealer', isPopularInEgypt: true },
  { id: 'golden-rose', nameAr: 'جولدن روز', nameEn: 'Golden Rose', country: 'Turkey / Egypt', categories: ['المكياج', 'الأظافر'], popularProducts: 'Velvet Matte Lipstick, Terracotta Stardust Blush, Rich Color Polish', isPopularInEgypt: true },
  { id: 'essence', nameAr: 'إيسنس', nameEn: 'Essence', country: 'Germany / Egypt', categories: ['المكياج', 'الأظافر'], popularProducts: 'Lash Princess False Lash Effect, Shine Shine Lipgloss, Make Me Brow', isPopularInEgypt: true },
  { id: 'topface', nameAr: 'توب فيس', nameEn: 'Topface', country: 'Turkey / Egypt', categories: ['المكياج'], popularProducts: 'Instyle Matte Lipstick, Skin Editor Foundation, Focus & Fix Concealer', isPopularInEgypt: true },
  { id: 'kiko-milano', nameAr: 'كيكو ميلانو', nameEn: 'KIKO Milano', country: 'Italy / Egypt', categories: ['المكياج', 'العناية بالبشرة'], popularProducts: '3D Hydra Lipgloss, Unlimited Double Touch, Smart Fusion Lipstick', isPopularInEgypt: true },
  { id: 'victorias-secret', nameAr: 'فيكتوريا سيكريت', nameEn: "Victoria's Secret", country: 'USA / Egypt', categories: ['العطور', 'العناية بالجسم'], popularProducts: 'Pure Seduction, Bare Vanilla, Velvet Petals, Love Spell Body Mist', isPopularInEgypt: true },
  { id: 'body-fantasies', nameAr: 'بودي فانتاسيز', nameEn: 'Body Fantasies', country: 'USA / Egypt', categories: ['العطور', 'العناية بالجسم'], popularProducts: 'Signature Japanese Cherry Blossom, Twilight Mist, Vanilla', isPopularInEgypt: true },
  { id: 'la-roche-posay', nameAr: 'لاروش بوزيه', nameEn: 'La Roche-Posay', country: 'France / Egypt', categories: ['Dermocosmetics', 'واقي الشمس', 'العناية بالبشرة'], popularProducts: 'Anthelios UVMune 400 SPF50+, Effaclar Duo+ M, Cicaplast Baume B5+', isPopularInEgypt: true },
  { id: 'cerave', nameAr: 'سيرافي', nameEn: 'CeraVe', country: 'USA / Egypt', categories: ['Dermocosmetics', 'العناية بالبشرة', 'العناية بالجسم'], popularProducts: 'Foaming Facial Cleanser, Moisturizing Cream for Dry Skin, Blemish Control Cleanser', isPopularInEgypt: true },
  { id: 'sensodyne', nameAr: 'سنسوداين', nameEn: 'Sensodyne', country: 'UK / Egypt', categories: ['العناية بالفم والأسنان'], popularProducts: 'Rapid Action, Multi Care Whitening, Repair & Protect', isPopularInEgypt: true },
  { id: 'johnsons-baby', nameAr: 'جونسون بيبي', nameEn: "Johnson's Baby", country: 'Global / Egypt', categories: ['منتجات الأطفال', 'العناية بالجسم'], popularProducts: 'No More Tears Shampoo, Bedtime Lotion, Pure Baby Oil', isPopularInEgypt: true },
  { id: 'gillette', nameAr: 'جيليت', nameEn: 'Gillette', country: 'Global / Egypt', categories: ['العناية بالرجال', 'إزالة الشعر'], popularProducts: 'Mach 3 Turbo, Blue 3 Sensitive, Series Shaving Foam', isPopularInEgypt: true },
  { id: 'veet', nameAr: 'فيت', nameEn: 'Veet', country: 'Global / Egypt', categories: ['إزالة الشعر'], popularProducts: 'Hair Removal Cream Sensitive Skin, Easy-Gel Wax Strips', isPopularInEgypt: true }
];

export const SKIN_TYPES = [
  'جميع أنواع البشرة (All Skin Types)',
  'بشرة دهنية (Oily Skin)',
  'بشرة مختلطة (Combination Skin)',
  'بشرة جافة (Dry Skin)',
  'بشرة حساسة (Sensitive Skin)',
  'بشرة عادية (Normal Skin)'
];

export const HAIR_TYPES = [
  'جميع أنواع الشعر (All Hair Types)',
  'شعر جاف وتالف (Dry & Damaged)',
  'شعر دهني وقشرة (Oily & Dandruff)',
  'شعر مصبوغ ومعالج (Color-Treated)',
  'شعر كيرلي ومموج (Curly & Wavy)',
  'شعر ناعم ومفرود (Straight & Fine)'
];

export const VERIFIED_SOURCES = [
  { name: 'Amazon.eg', labelAr: 'أمازون مصر (Amazon Egypt)', url: 'https://amazon.eg', icon: '' },
  { name: 'Carrefour Egypt', labelAr: 'كارفور مصر الرسمي', url: 'https://carrefouregypt.com', icon: '' },
  { name: 'ElEzaby Pharmacy', labelAr: 'صيدليات العزبي', url: 'https://elezabypharmacy.com', icon: '' },
  { name: 'Seif Pharmacies', labelAr: 'صيدليات سيف', url: 'https://seif-pharmacies.com', icon: '' },
  { name: 'Eva Cosmetics Official', labelAr: 'متجر إيفا كوزماتيكس الرسمي', url: 'https://evacosmetics.com', icon: '' },
  { name: 'Noon Egypt', labelAr: 'نون مصر (Noon.com)', url: 'https://noon.com/egypt-ar', icon: '' }
];
