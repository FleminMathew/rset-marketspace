const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for items currently available for sale
const productSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    description: String,
    sellerId: { type: String, required: true, index: true },
    imageUrl: String,
    contactDetails: { type: String, required: true }, // New field for contact info
    createdAt: { type: Date, default: Date.now }
});

// Schema for items that have been sold (a historical record)
const soldProductSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    imageUrl: String,
    sellerId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    contactDetails: { type: String }, // Contact info is carried over
    soldAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const SoldProduct = mongoose.models.SoldProduct || mongoose.model('SoldProduct', soldProductSchema);

module.exports = { Product, SoldProduct };

