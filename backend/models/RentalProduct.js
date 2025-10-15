const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    contactDetails: String,
    deliveryZones: {
        type: [String],
        required: true,
        validate: [val => val.length >= 3, 'Please select at least 3 delivery zones.']
    },
    isRented: { type: Boolean, default: false },
    reviews: [reviewSchema],
    reviewSummary: { type: String, default: 'No reviews yet.' },
    createdAt: { type: Date, default: Date.now }
});

// Schema for items that have been rented out (a historical record)
const rentedProductSchema = new Schema({
    originalRentalId: { type: Schema.Types.ObjectId, ref: 'RentalProduct' },
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: String,
    imageUrl: String,
    ownerId: { type: String, required: true },
    rentalPricePerDay: { type: Number, required: true },
    renterId: { type: String, required: true },
    rentalDays: { type: Number, required: true, min: 1 },
    contactDetails: String,
    selectedZone: { type: String, required: true }, // The zone chosen by the renter
    rentedAt: { type: Date, default: Date.now }
});

const RentalProduct = mongoose.models.RentalProduct || mongoose.model('RentalProduct', rentalProductSchema);
const RentedProduct = mongoose.models.RentedProduct || mongoose.model('RentedProduct', rentedProductSchema);

module.exports = { RentalProduct, RentedProduct };

