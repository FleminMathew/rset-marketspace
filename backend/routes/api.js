const express = require('express');
const multer = require('multer');
const path = require('path');
const { Product, SoldProduct } = require('../models/Product');
const { RentalProduct, RentedProduct } = require('../models/RentalProduct');
const { summarizeReviews, getEmbedding } = require('../utils/cohere');

const router = express.Router();

// --- Helper Function for Cosine Similarity ---
function cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// --- Multer Setup ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => { cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`); }
});
const upload = multer({ storage });

// --- Auth Route ---
router.post('/auth/magiclink', async (req, res) => {
    const { email } = req.body;
    const supabase = req.app.get('supabase');
    if (!email) return res.status(400).json({ message: 'Email is required.' });
    if (!email.endsWith('@rajagiri.edu.in')) return res.status(400).json({ message: 'Only @rajagiri.edu.in email addresses are allowed.' });
    try {
        const { error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
        res.status(200).json({ message: 'Magic link has been sent.' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'An error occurred.' });
    }
});

// --- Product (Buy/Sell) Routes ---
router.post('/products', upload.single('image'), async (req, res) => {
    try {
        const { name, category, price, description, sellerId, contactDetails, deliveryZones } = req.body;
        const embeddingText = `${name} ${description}`;
        const descriptionEmbedding = await getEmbedding(embeddingText);
        const newProduct = new Product({ name, category, price: parseFloat(price), description, sellerId, contactDetails, deliveryZones: JSON.parse(deliveryZones), descriptionEmbedding, imageUrl: req.file ? `/uploads/${req.file.filename}` : null });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/products', async (req, res) => {
    try { const products = await Product.find({ isSold: false }); res.json(products); } 
    catch (error) { res.status(500).json({ message: 'Error fetching products' }); }
});

router.post('/purchase', async (req, res) => {
    try {
        const { cart, userId } = req.body;
        for (const item of cart) {
            const product = await Product.findById(item._id);
            if (product && !product.isSold) {
                await new SoldProduct({ ...product.toObject(), _id: undefined, originalProductId: product._id, buyerId: userId, selectedZone: item.selectedZone, soldAt: new Date() }).save();
                product.isSold = true;
                await product.save();
            }
        }
        res.status(200).json({ message: 'Purchase successful' });
    } catch (error) { res.status(500).json({ message: 'An error occurred during purchase.' }); }
});

router.get('/sold-products/:userId', async (req, res) => { try { const products = await SoldProduct.find({ buyerId: req.params.userId }).sort({ soldAt: -1 }); res.json(products); } catch (error) { res.status(500).json({ message: 'Error fetching purchases.' }); } });
router.get('/seller-items/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const allSellerProducts = await Product.find({ sellerId }).sort({ createdAt: -1 }).lean();
        const productIds = allSellerProducts.filter(p => p.isSold).map(p => p._id);
        const recentSales = await SoldProduct.find({ originalProductId: { $in: productIds } }).sort({ soldAt: -1 });
        const salesMap = new Map(recentSales.map(sale => [sale.originalProductId.toString(), sale]));
        const results = allSellerProducts.map(product => product.isSold ? { ...product, status: 'Sold', buyerId: salesMap.get(product._id.toString())?.buyerId, selectedZone: salesMap.get(product._id.toString())?.selectedZone } : { ...product, status: 'Available' });
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
    } catch (error) { res.status(500).json({ message: `Server error: ${error.message}` }); }
});

// --- NEW Similar Products Route ---
router.get('/products/:id/similar', async (req, res) => {
    try {
        const targetProduct = await Product.findById(req.params.id);
        if (!targetProduct || !targetProduct.descriptionEmbedding) {
            return res.json([]);
        }
        const allOtherProducts = await Product.find({ _id: { $ne: req.params.id }, isSold: false });
        const similarities = allOtherProducts.map(product => ({
            product,
            similarity: cosineSimilarity(targetProduct.descriptionEmbedding, product.descriptionEmbedding)
        }));
        similarities.sort((a, b) => b.similarity - a.similarity);
        res.json(similarities.slice(0, 3).map(s => s.product));
    } catch (error) {
        res.status(500).json({ message: "Error finding similar products." });
    }
});


// --- Rental Routes ---
router.post('/rentals', upload.single('image'), async (req, res) => { 
    try { 
        const { name, category, rentalPricePerDay, description, ownerId, contactDetails, deliveryZones } = req.body;
        const embeddingText = `${name} ${description}`;
        const descriptionEmbedding = await getEmbedding(embeddingText);
        const newRental = new RentalProduct({ name, category, rentalPricePerDay: parseFloat(rentalPricePerDay), description, ownerId, contactDetails, deliveryZones: JSON.parse(deliveryZones), descriptionEmbedding, imageUrl: req.file ? `/uploads/${req.file.filename}` : null }); 
        await newRental.save(); 
        res.status(201).json(newRental); 
    } catch (error) { 
        res.status(400).json({ message: error.message || 'Error listing rental item.' }); 
    } 
});
router.get('/rentals', async (req, res) => { try { const rentals = await RentalProduct.find({ isRented: false }); res.json(rentals); } catch (error) { res.status(500).json({ message: 'Error fetching rentals.' }); } });
router.post('/rentals/:id/reviews', async (req, res) => { try { const rental = await RentalProduct.findById(req.params.id); if (!rental) return res.status(404).json({ message: 'Rental not found.' }); rental.reviews.push(req.body); rental.reviewSummary = await summarizeReviews(rental.reviews); await rental.save(); res.status(201).json(rental); } catch (error) { res.status(500).json({ message: 'Error adding review.' }); } });
router.post('/rent-items', async (req, res) => { 
    try { 
        for (const item of req.body.cart) { 
            const rental = await RentalProduct.findById(item._id); 
            if (rental && !rental.isRented) { 
                await new RentedProduct({ ...rental.toObject(), _id: undefined, originalRentalId: rental._id, renterId: req.body.userId, rentalDays: item.rentalDays, selectedZone: item.selectedZone, rentedAt: new Date() }).save(); 
                await RentalProduct.findByIdAndUpdate(item._id, { isRented: true }); 
            } 
        } 
        res.status(200).json({ message: 'Rental successful' }); 
    } catch (error) { res.status(500).json({ message: 'An error occurred during the rental.' }); } 
});
router.get('/seller-rentals/:ownerId', async (req, res) => { try { const rentals = await RentalProduct.find({ ownerId: req.params.ownerId }).sort({ createdAt: -1 }).lean(); res.json(rentals); } catch (error) { res.status(500).json({ message: "Error fetching seller rentals." }); } });
router.patch('/rentals/:id/make-available', async (req, res) => { try { const { id } = req.params; const { userId } = req.body; const rental = await RentalProduct.findById(id); if (!rental) return res.status(404).json({ message: "Rental not found." }); if (rental.ownerId !== userId) return res.status(403).json({ message: "Not authorized." }); rental.isRented = false; await rental.save(); res.json({ message: "Item is now available." }); } catch (error) { res.status(500).json({ message: `Server error: ${error.message}` }); } });

// --- NEW Similar Rentals Route ---
router.get('/rentals/:id/similar', async (req, res) => {
    try {
        const targetRental = await RentalProduct.findById(req.params.id);
        if (!targetRental || !targetRental.descriptionEmbedding) {
            return res.json([]);
        }
        const allOtherRentals = await RentalProduct.find({ _id: { $ne: req.params.id }, isRented: false });
        const similarities = allOtherRentals.map(rental => ({
            rental,
            similarity: cosineSimilarity(targetRental.descriptionEmbedding, rental.descriptionEmbedding)
        }));
        similarities.sort((a, b) => b.similarity - a.similarity);
        res.json(similarities.slice(0, 3).map(s => s.rental));
    } catch (error) {
        res.status(500).json({ message: "Error finding similar rentals." });
    }
});


module.exports = router;

