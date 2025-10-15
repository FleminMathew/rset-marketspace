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
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    if (!email.endsWith('@rajagiri.edu.in')) return res.status(400).json({ message: 'Only @rajagiri.edu.in email addresses are allowed.' });
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

router.post('/products', upload.single('image'), async (req, res) => {
    try {
        const { name, category, price, description, sellerId, contactDetails, deliveryZones } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const newProduct = new Product({ name, category, price: parseFloat(price), description, sellerId, imageUrl, contactDetails, deliveryZones: JSON.parse(deliveryZones) });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.error("Error adding product:", error);
        res.status(400).json({ message: error.message || 'Error adding product' });
    }
});

router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({ isSold: false });
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: 'Error fetching products' });
    }
});

router.post('/purchase', async (req, res) => {
    try {
        const { cart, userId } = req.body;
        for (const item of cart) {
            const product = await Product.findById(item._id);
            if (product && !product.isSold) {
                const soldItem = new SoldProduct({ ...product.toObject(), _id: undefined, originalProductId: product._id, buyerId: userId, selectedZone: item.selectedZone, soldAt: new Date() });
                await soldItem.save();
                product.isSold = true;
                await product.save();
            }
        }
        res.status(200).json({ message: 'Purchase successful' });
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ message: 'An error occurred during purchase.' });
    }
});

router.get('/sold-products/:userId', async (req, res) => { try { const products = await SoldProduct.find({ buyerId: req.params.userId }).sort({ soldAt: -1 }); res.json(products); } catch (error) { res.status(500).json({ message: 'Error fetching user purchases.' }); } });

router.get('/seller-items/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const allSellerProducts = await Product.find({ sellerId }).sort({ createdAt: -1 }).lean();
        const productIds = allSellerProducts.filter(p => p.isSold).map(p => p._id);
        const recentSales = await SoldProduct.find({ originalProductId: { $in: productIds } }).sort({ soldAt: -1 });
        const salesMap = new Map();
        recentSales.forEach(sale => { if (!salesMap.has(sale.originalProductId.toString())) { salesMap.set(sale.originalProductId.toString(), sale); } });
        const results = allSellerProducts.map(product => { if (product.isSold) { const saleInfo = salesMap.get(product._id.toString()); return { ...product, status: 'Sold', buyerId: saleInfo ? saleInfo.buyerId : 'N/A', selectedZone: saleInfo ? saleInfo.selectedZone : 'N/A' }; } return { ...product, status: 'Available' }; });
        res.json(results);
    } catch (error) { res.status(500).json({ message: 'Error fetching seller items.' }); }
});

router.patch('/products/:id/make-available', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ message: "Product not found." });
        if (product.sellerId !== userId) return res.status(403).json({ message: "Not authorized." });
        product.isSold = false;
        await product.save();
        res.json({ message: "Item is now available." });
    } catch (error) { 
        console.error("Error making product available:", error);
        res.status(500).json({ message: `Server error: ${error.message}` });
    }
});

// --- Rental Routes ---
router.post('/rentals', upload.single('image'), async (req, res) => { 
    try { 
        const { name, category, rentalPricePerDay, description, ownerId, contactDetails, deliveryZones } = req.body; 
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; 
        const newRental = new RentalProduct({ name, category, rentalPricePerDay: parseFloat(rentalPricePerDay), description, ownerId, imageUrl, contactDetails, deliveryZones: JSON.parse(deliveryZones) }); 
        await newRental.save(); 
        res.status(201).json(newRental); 
    } catch (error) { 
        res.status(400).json({ message: error.message || 'Error listing rental item.' }); 
    } 
});
router.get('/rentals', async (req, res) => { try { const rentals = await RentalProduct.find({ isRented: false }); res.json(rentals); } catch (error) { res.status(500).json({ message: 'Error fetching rentals.' }); } });
router.post('/rentals/:id/reviews', async (req, res) => { try { const rental = await RentalProduct.findById(req.params.id); if (!rental) return res.status(404).json({ message: 'Rental item not found.' }); const { userId, rating, comment } = req.body; rental.reviews.push({ userId, rating, comment }); rental.reviewSummary = await summarizeReviews(rental.reviews); await rental.save(); res.status(201).json(rental); } catch (error) { res.status(500).json({ message: 'Error adding review.' }); } });
router.post('/rent-items', async (req, res) => { 
    try { 
        const { cart, userId } = req.body; 
        for (const item of cart) { 
            const rental = await RentalProduct.findById(item._id); 
            if (rental && !rental.isRented) { 
                const rentedRecord = new RentedProduct({ ...rental.toObject(), _id: undefined, originalRentalId: rental._id, renterId: userId, rentalDays: item.rentalDays, selectedZone: item.selectedZone, rentedAt: new Date() }); 
                await rentedRecord.save(); 
                await RentalProduct.findByIdAndUpdate(item._id, { isRented: true }); 
            } 
        } 
        res.status(200).json({ message: 'Rental successful' }); 
    } catch (error) { res.status(500).json({ message: 'An error occurred during the rental transaction.' }); } 
});
router.get('/seller-rentals/:ownerId', async (req, res) => { try { const { ownerId } = req.params; const rentalItems = await RentalProduct.find({ ownerId }).sort({ createdAt: -1 }).lean(); res.json(rentalItems); } catch (error) { res.status(500).json({ message: "Error fetching seller's rental items." }); } });
router.patch('/rentals/:id/make-available', async (req, res) => { 
    try { 
        const { id } = req.params; 
        const { userId } = req.body; 
        const rental = await RentalProduct.findById(id); 
        if (!rental) { return res.status(404).json({ message: "Rental item not found." }); } 
        if (rental.ownerId !== userId) { return res.status(403).json({ message: "Not authorized." }); } 
        rental.isRented = false; 
        await rental.save(); 
        res.json({ message: "Item is now available." }); 
    } catch (error) { 
        console.error("Error making rental available:", error); 
        res.status(500).json({ message: `Server error: ${error.message}` }); 
    } 
});

module.exports = router;

