import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  governorate?: string;
  city?: string;
  address?: string;
  comparePassword(password: string): Promise<boolean>;
}

const CustomerSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    governorate: { type: String },
    city: { type: String },
    address: { type: String },
  },
  { timestamps: true }
);

CustomerSchema.pre('save', async function (this: ICustomer) {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

CustomerSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
