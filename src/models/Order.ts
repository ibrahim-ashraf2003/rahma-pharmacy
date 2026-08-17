import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomerInfo {
  name: string;
  phone: string;
  email?: string;
  governorate: string;
  city?: string;
  address: string;
  notes?: string;
}

export interface IOrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerId?: mongoose.Types.ObjectId;
  customer: ICustomerInfo;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'cash' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymobOrderId?: string;
  paymobTransactionId?: string;
  statusHistory: { status: string; date: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderNumber: { type: String, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      governorate: { type: String, required: true },
      city: { type: String },
      address: { type: String, required: true },
      notes: { type: String }
    },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        size: { type: String },
        color: { type: String }
      }
    ],
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 50 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['cash', 'card'], default: 'cash' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymobOrderId: { type: String },
    paymobTransactionId: { type: String },
    statusHistory: [{
      status: { type: String },
      date: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true }
);

// Auto-generate orderNumber before save
OrderSchema.pre('save', async function (this: any) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `TM-${String(count + 1).padStart(6, '0')}`;
  }
  // Add initial status to history
  if (this.isNew) {
    this.statusHistory = [{ status: this.orderStatus, date: new Date() }];
  }
});

export default mongoose.model<IOrder>('Order', OrderSchema);
