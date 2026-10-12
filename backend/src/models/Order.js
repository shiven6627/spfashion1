const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'], required: true },
  note: { type: String, default: '' },
  at: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderNumber: { type: String, unique: true, index: true },
  customer: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
  },
  shippingAddress: {
    address: { type: String, required: true }, apartment: { type: String, default: '' },
    city: { type: String, required: true }, state: { type: String, required: true },
    pincode: { type: String, required: true }, country: { type: String, default: 'India' },
  },
  items: [{
    productId: String,
    name: { type: String, required: true }, image: String, category: String,
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  }],
  subtotal: { type: Number, required: true, min: 0 },
  shippingFee: { type: Number, default: 0 },
  total: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, enum: ['cod'], default: 'cod' },
  status: { type: String, enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'placed', index: true },
  statusHistory: { type: [statusHistorySchema], default: [] },
}, { timestamps: true });

orderSchema.pre('validate', function(next) {
  if (!this.orderNumber) this.orderNumber = `SP${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
  if (!this.statusHistory?.length) this.statusHistory = [{ status: this.status || 'placed', note: 'Order placed' }];
  next();
});

module.exports = mongoose.model('Order', orderSchema);
