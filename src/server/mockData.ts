export interface InMemoryProduct{_id:string;name:string;description:string;price:number;originalPrice?:number;image:string;images?:string[];category:string;stock:number;badge?:string;sizes?:string[];colors?:string[];featured?:boolean;active?:boolean;[key:string]:any}
export interface InMemoryCoupon{_id:string;code:string;discountType:'percentage'|'fixed';discountValue:number;active:boolean;usageLimit:number;usedCount:number;minOrderAmount?:number;expiresAt?:string;[key:string]:any}
export interface InMemoryOrder{_id:string;orderNumber:string;customer:any;items:any[];subtotal:number;shippingFee:number;discount:number;total:number;paymentMethod:'cash'|'card';paymentStatus:string;orderStatus:string;statusHistory:any[];[key:string]:any}
export interface InMemoryReview{_id:string;productId:string;customerName:string;rating:number;comment:string;approved:boolean;[key:string]:any}
export const initialProducts:InMemoryProduct[]=[];
export const initialCoupons:InMemoryCoupon[]=[];
export const initialOrders:InMemoryOrder[]=[];
export const initialReviews:InMemoryReview[]=[];
