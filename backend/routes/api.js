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

// --- Supabase Passwordless Auth Route ---
router.post('/auth/magiclink', async (req, res) => {
    const { email } = req.body;
    const supabase = req.app.get('supabase');

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }
    if (!email.endsWith('@rajagiri.edu.in')) {
        return res.status(400).json({ message: 'Only @rajagiri.edu.in email addresses are allowed.' });
    }

    try {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        res.status(200).json({ message: 'Magic link has been sent to your email.' });
    } catch (error) {
        console.error('Magic link error:', error);
        res.status(500).json({ message: error.message || 'An error occurred.' });
    }
});


// --- Product (Buy/Sell) Routes ---

// POST a new product for sale
router.post('/products', upload.single('image'), async (req, res) => {
    try {
        const { name, category, quantity, price, description, sellerId } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const newProduct = new Product({ name, category, quantity: parseInt(quantity, 10), price: parseFloat(price), description, sellerId, imageUrl });
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

// POST to handle a purchase transaction
router.post('/purchase', async (req, res) => {
    try {
        const { cart, userId } = req.body;
        const soldItemsPromises = [];

        for (const item of cart) {
            const product = await Product.findById(item._id);
            if (product && product.quantity > 0) {
                // Ensure sellerId is copied from the original product
                const soldItem = new SoldProduct({ 
                    ...product.toObject(), 
                    _id: undefined, // Let MongoDB generate a new ID for the sold record
                    buyerId: userId, 
                    sellerId: product.sellerId, // Explicitly carry over sellerId
                    soldAt: new Date() 
                });
                soldItemsPromises.push(soldItem.save());
                
                product.quantity -= 1;
                if (product.quantity === 0) {
                    await Product.findByIdAndDelete(item._id);
                } else {
                    await product.save();
                }
            }
        }
        await Promise.all(soldItemsPromises);
        res.status(200).json({ message: 'Purchase successful' });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ message: 'An error occurred during purchase.' });
    }
});

// GET products sold to a specific user (their purchase history)
router.get('/sold-products/:userId', async (req, res) => {
    try {
        const products = await SoldProduct.find({ buyerId: req.params.userId }).sort({ soldAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user purchases.' });
    }
});

// --- NEW SELLER DASHBOARD ENDPOINT ---
// GET all products listed by a specific seller (both available and sold)
router.get('/seller-items/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;

        // Get items still available for sale
        const availableItems = await Product.find({ sellerId }).lean();
        const availableWithStatus = availableItems.map(item => ({ ...item, status: 'Available' }));

        // Get items that have been sold by this seller
        const soldItems = await SoldProduct.find({ sellerId }).lean();
        const soldWithStatus = soldItems.map(item => ({ ...item, status: 'Sold' }));

        // Combine and sort by date
        const allItems = [...availableWithStatus, ...soldWithStatus];
        allItems.sort((a, b) => {
            const dateA = a.soldAt || a.createdAt;
            const dateB = b.soldAt || b.createdAt;
            return new Date(dateB) - new Date(dateA);
        });

        res.json(allItems);
    } catch (error) {
        console.error("Error fetching seller items:", error);
        res.status(500).json({ message: 'Error fetching seller items.' });
    }
});


// --- Rental Routes ---

// POST a new rental item
router.post('/rentals', upload.single('image'), async (req, res) => {
    try {
        const { name, category, rentalPricePerDay, description, ownerId } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const newRental = new RentalProduct({ name, category, rentalPricePerDay: parseFloat(rentalPricePerDay), description, ownerId, imageUrl });
        await newRental.save();
        res.status(201).json(newRental);
    } catch (error) {
        res.status(500).json({ message: 'Error listing rental item.' });
    }
});

// GET all available rental items
router.get('/rentals', async (req, res) => {
    try {
        const rentals = await RentalProduct.find({ isRented: false });
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rentals.' });
    }
});

// POST a new review for a rental item
router.post('/rentals/:id/reviews', async (req, res) => {
    try {
        const rental = await RentalProduct.findById(req.params.id);
        if (!rental) return res.status(404).json({ message: 'Rental item not found.' });

        const { userId, rating, comment } = req.body;
        rental.reviews.push({ userId, rating, comment });
        
        rental.reviewSummary = await summarizeReviews(rental.reviews);
        await rental.save();
        res.status(201).json(rental);
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: 'Error adding review.' });
    }
});

// POST to handle a rental transaction
router.post('/rent-items', async (req, res) => {
    try {
        const { cart, userId } = req.body;
        const rentedItemsPromises = [];

        for (const item of cart) {
            const rental = await RentalProduct.findById(item._id);
            if (rental && !rental.isRented) {
                const rentedRecord = new RentedProduct({
                    ...rental.toObject(),
                     _id: undefined,
                    renterId: userId,
                    rentalDays: item.rentalDays,
                    rentedAt: new Date()
                });
                rentedItemsPromises.push(rentedRecord.save());
                await RentalProduct.findByIdAndUpdate(item._id, { isRented: true });
            }
        }
        await Promise.all(rentedItemsPromises);
        res.status(200).json({ message: 'Rental successful' });
    } catch (error) {
        console.error("Error during rental transaction:", error);
        res.status(500).json({ message: 'An error occurred during the rental transaction.' });
    }
});

module.exports = router;

