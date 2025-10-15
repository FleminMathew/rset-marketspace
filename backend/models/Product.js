const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for items listed for sale
const productSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    sellerId: { type: String, required: true, index: true },
    imageUrl: String,
    contactDetails: String,
    deliveryZones: {
        type: [String],
        required: true,
        validate: [val => val.length >= 3, 'Please select at least 3 delivery zones.']
    },
    isSold: { type: Boolean, default: false, index: true },
    createdAt: { type: Date, default: Date.now }
});

// Schema for the historical record of a sale
const soldProductSchema = new Schema({
    originalProductId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    imageUrl: String,
    sellerId: { type: String, required: true, index: true },
    buyerId: { type: String, required: true, index: true },
    contactDetails: String,
    selectedZone: { type: String, required: true }, // The zone chosen by the buyer
    soldAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const SoldProduct = mongoose.models.SoldProduct || mongoose.model('SoldProduct', soldProductSchema);

module.exports = { Product, SoldProduct };

