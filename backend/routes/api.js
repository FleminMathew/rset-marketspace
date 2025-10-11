const express = require('express');
const multer = require('multer');
const path = require('path');
const { Product, SoldProduct } = require('../models/Product');
const { RentalProduct, RentedProduct } = require('../models/RentalProduct');
const { summarizeReviews } = require('../utils/cohere');

const router = express.Router();

// --- Multer Setup for Image Uploads ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });


// --- Product (Buy/Sell) Routes ---

// POST a new product for sale
router.post('/products', upload.single('image'), async (req, res) => {
    try {
        const { name, category, quantity, price, description, sellerId } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newProduct = new Product({
            name,
            category,
            quantity: parseInt(quantity, 10),
            price: parseFloat(price),
            description,
            sellerId,
            imageUrl
        });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(500).json({ message: 'Error adding product', error: error.message });
    }
});

// GET all available products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

// GET sold products for a specific buyer
router.get('/sold-products/:userId', async (req, res) => {
    try {
        const products = await SoldProduct.find({ buyerId: req.params.userId });
        res.json(products);
    } catch (error) {
        console.error("Error fetching sold products:", error);
        res.status(500).json({ message: 'Error fetching sold products' });
    }
});

// POST a purchase transaction
router.post('/purchase', async (req, res) => {
    const { cart, userId } = req.body;
    try {
        for (const item of cart) {
            const product = await Product.findById(item._id);
            if (product && product.quantity > 0) {
                const soldItem = new SoldProduct({
                    ...product.toObject(),
                    _id: undefined, // Let MongoDB generate a new ID
                    buyerId: userId,
                    soldAt: new Date()
                });
                await soldItem.save();
                product.quantity -= 1;
                if (product.quantity === 0) {
                    await Product.findByIdAndDelete(item._id);
                } else {
                    await product.save();
                }
            }
        }
        res.status(200).json({ message: 'Purchase successful' });
    } catch (error) {
        console.error('Error during purchase transaction:', error);
        res.status(500).json({ message: 'Server error during purchase' });
    }
});


// --- Rental Routes ---

// POST a new rental item
router.post('/rentals', upload.single('image'), async (req, res) => {
    try {
        const { name, category, description, ownerId, rentalPricePerDay } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const newRental = new RentalProduct({
            name,
            category,
            description,
            ownerId,
            rentalPricePerDay: parseFloat(rentalPricePerDay),
            imageUrl,
        });
        await newRental.save();
        res.status(201).json(newRental);
    } catch (error) {
        console.error("Error adding rental:", error);
        res.status(500).json({ message: 'Error adding rental', error: error.message });
    }
});

// GET all available rental items
router.get('/rentals', async (req, res) => {
    try {
        const rentals = await RentalProduct.find({ isRented: false });
        res.json(rentals);
    } catch (error) {
        console.error("Error fetching rentals:", error);
        res.status(500).json({ message: 'Error fetching rentals' });
    }
});

// POST a new review for a rental item
router.post('/rentals/:id/reviews', async (req, res) => {
    try {
        const rental = await RentalProduct.findById(req.params.id);
        if (!rental) {
            return res.status(404).json({ message: 'Rental item not found' });
        }
        const { userId, rating, comment } = req.body;
        rental.reviews.push({ userId, rating, comment });

        // Trigger AI summarization
        const summary = await summarizeReviews(rental.reviews);
        rental.reviewSummary = summary;
        
        await rental.save();
        res.status(201).json(rental);
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: 'Error adding review' });
    }
});

// POST a rental transaction
router.post('/rent-items', async (req, res) => {
    const { cart, userId } = req.body;
    try {
        for (const item of cart) {
            const rentalProduct = await RentalProduct.findById(item._id);
            if (rentalProduct && !rentalProduct.isRented) {
                // Create a historical record of the rental
                const rentedItem = new RentedProduct({
                    ...rentalProduct.toObject(),
                    _id: undefined,
                    renterId: userId,
                    rentalDays: item.rentalDays || 1, // Ensure rentalDays is included
                    rentedAt: new Date(),
                });
                await rentedItem.save();

                // Mark the original item as rented
                rentalProduct.isRented = true;
                await rentalProduct.save();
            }
        }
        res.status(200).json({ message: 'Rental successful' });
    } catch (error) {
        console.error('Error during rental transaction:', error);
        res.status(500).json({ message: 'Server error during rental' });
    }
});


module.exports = router;

