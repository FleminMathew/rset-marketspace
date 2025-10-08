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

// GET products sold BY a specific user
router.get('/sold-by/:userId', async (req, res) => {
    try {
        const products = await SoldProduct.find({ sellerId: req.params.userId });
        res.json(products);
    } catch (error) {
        console.error("Error fetching sold-by products:", error);
        res.status(500).json({ message: 'Error fetching sold products' });
    }
});


// GET products bought BY a specific user
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
            // Create a historical record of the sold item
            const soldItem = new SoldProduct({
                name: item.name,
                category: item.category,
                price: item.price,
                description: item.description,
                imageUrl: item.imageUrl,
                sellerId: item.sellerId,
                buyerId: userId
            });
            await soldItem.save();

            // Remove the original item from the 'products' collection
            await Product.findByIdAndDelete(item._id);
        }
        res.status(200).json({ message: 'Purchase successful' });
    } catch (error) {
        console.error('Error during purchase transaction:', error);
        res.status(500).json({ message: 'Error during purchase transaction' });
    }
});


// --- Rental Routes ---

// POST a new item for rent
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
            imageUrl
        });
        const savedRental = await newRental.save();
        res.status(201).json(savedRental);
    } catch (error) {
        console.error("Error adding rental item:", error);
        res.status(500).json({ message: 'Error adding rental item', error: error.message });
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

// POST a review for a rental item
router.post('/rentals/:id/reviews', async (req, res) => {
    try {
        const { userId, rating, comment } = req.body;
        const rental = await RentalProduct.findById(req.params.id);

        if (!rental) return res.status(404).json({ message: 'Rental item not found' });
        
        rental.reviews.push({ userId, rating, comment });
        
        // Summarize reviews if there are any
        if (rental.reviews.length > 0) {
            const allComments = rental.reviews.map(r => r.comment).join('\n');
            rental.reviewSummary = await summarizeReviews(allComments);
        }
        
        await rental.save();
        res.status(201).json(rental);
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: 'Error adding review', error: error.message });
    }
});

// POST a rental transaction
router.post('/rent-items', async (req, res) => {
    const { cart, userId } = req.body; // cart is an array of rental items
    try {
        for (const item of cart) {
            // Create a historical record in RentedProducts collection
            const rentedRecord = new RentedProduct({
                name: item.name,
                category: item.category,
                description: item.description,
                imageUrl: item.imageUrl,
                ownerId: item.ownerId,
                rentalPricePerDay: item.rentalPricePerDay,
                renterId: userId,
                rentalDays: item.rentalDays // This is crucial
            });
            await rentedRecord.save();

            // Mark the original item as rented in the RentalProducts collection
            await RentalProduct.findByIdAndUpdate(item._id, { isRented: true });
        }
        res.status(200).json({ message: 'Rental successful' });
    } catch (error) {
        console.error('Error during rental transaction:', error);
        res.status(500).json({ message: 'Error during rental transaction', error: error.message });
    }
});

module.exports = router;

