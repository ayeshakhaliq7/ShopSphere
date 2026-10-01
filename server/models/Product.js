const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0, default: null },
    // Effective selling price, kept in sync in the pre-save hook so it can be filtered/sorted in MongoDB.
    finalPrice: { type: Number, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    images: { type: [String], validate: (v) => v.length > 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.pre('save', function setFinalPrice(next) {
  const hasDiscount = this.discountPrice && this.discountPrice > 0 && this.discountPrice < this.price;
  this.finalPrice = hasDiscount ? this.discountPrice : this.price;
  next();
});

productSchema.set('toJSON', { transform: (_d, ret) => { delete ret.__v; return ret; } });

module.exports = mongoose.model('Product', productSchema);
