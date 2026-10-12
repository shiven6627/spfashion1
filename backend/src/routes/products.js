const router = require('express').Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
    try {
        const q = {};

        if (req.query.category) {
            q.category = req.query.category;
        }

        if (req.query.search) {
            q.$text = { $search: req.query.search };
        }

        const products = await Product.find(q).sort({ createdAt: -1 });

        res.json({ products });
    } catch (e) {
        res.status(500).json({ message: 'Could not fetch products.' });
    }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products });
});

router.get('/:id', async (req, res) => {
    try {
        const p = await Product.findById(req.params.id);

        if (!p) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.json({ product: p });
    } catch (e) {
        res.status(400).json({ message: 'Invalid product ID.' });
    }
});

router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { name, category, price, image } = req.body;

        if (!name || !category || price === undefined || !image) {
            return res.status(400).json({
                message: 'Name, category, price and image are required.'
            });
        }

        const product = await Product.create({
            ...req.body,
            createdBy: req.user._id
        });

        res.status(201).json({ product });
    } catch (e) {
        res.status(400).json({
            message: e.message || 'Could not create product.'
        });
    }
});

router.patch('/:id', protect, adminOnly, async (req, res) => {
    try {
        const p = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!p) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        res.json({ product: p });
    } catch (e) {
        res.status(400).json({ message: 'Could not update product.' });
    }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
    const p = await Product.findByIdAndDelete(req.params.id);

    if (!p) {
        return res.status(404).json({ message: 'Product not found.' });
    }

    res.json({ message: 'Product deleted.' });
});

module.exports = router;