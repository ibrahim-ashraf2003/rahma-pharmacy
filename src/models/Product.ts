import mongoose, { Schema, Document } from 'mongoose';

export interface IProductReview {
  name: string;
  rating: number;
  comment?: string;
  approved?: boolean;
  createdAt?: Date;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  subCategory?: string;
  stock: number;
  badge?: string;
  sizes?: string[];
  colors?: string[];
  featured?: boolean;
  active?: boolean;
  averageRating?: number;
  reviewsCount?: number;
  reviews?: IProductReview[];
}

const ProductReviewSchema = new Schema<IProductReview>({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  approved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    category: { type: String, required: true, default: 'Men' },
    subCategory: { type: String },
    stock: { type: Number, required: true, default: 0, min: 0 },
    badge: { type: String },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    averageRating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    reviews: { type: [ProductReviewSchema], default: [] }
  },
  { timestamps: true }
);

ProductSchema.index({ category: 1, active: 1, createdAt: -1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
