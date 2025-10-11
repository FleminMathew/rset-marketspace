const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sub-schema for individual reviews
const reviewSchema = new Schema({
    userId: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Schema for items currently available for rent
const rentalProductSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    ownerId: { type: String, required: true },
    imageUrl: String,
    rentalPricePerDay: { type: Number, required: true },
    isRented: { type: Boolean, default: false },
    reviews: [reviewSchema],
    reviewSummary: { type: String, default: 'No reviews yet.' }, // Field for AI summary
    createdAt: { type: Date, default: Date.now }
});

// Schema for items that have been rented out (a historical record)
const rentedProductSchema = new Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    imageUrl: String,
    ownerId: { type: String, required: true },
    rentalPricePerDay: { type: Number, required: true },
    renterId: { type: String, required: true },
    rentalDays: { type: Number, required: true, min: 1 },
    rentedAt: { type: Date, default: Date.now }
});

const RentalProduct = mongoose.models.RentalProduct || mongoose.model('RentalProduct', rentalProductSchema);
const RentedProduct = mongoose.models.RentedProduct || mongoose.model('RentedProduct', rentedProductSchema);

module.exports = { RentalProduct, RentedProduct };

