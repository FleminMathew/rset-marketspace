const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for items currently available for sale
const productSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true },
    description: String,
    sellerId: { type: String, required: true },
    imageUrl: String,
    createdAt: { type: Date, default: Date.now }
});

// Schema for items that have been sold (a historical record)
const soldProductSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    imageUrl: String,
    sellerId: { type: String, required: true },
    buyerId: { type: String, required: true },
    soldAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const SoldProduct = mongoose.models.SoldProduct || mongoose.model('SoldProduct', soldProductSchema);

module.exports = { Product, SoldProduct };

