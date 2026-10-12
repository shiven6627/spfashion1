
const router = require('express').Router();

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const { protect, adminOnly } = require('../middleware/auth');

const STATUSES = [
    'placed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
];

function dateFilter(from, to) {
    const filter = {};

    if (from) {
        filter.$gte = new Date(`${from}T00:00:00+05:30`);
    }

    if (to) {
        filter.$lte = new Date(`${to}T23:59:59.999+05:30`);
    }

    return Object.keys(filter).length
        ? { createdAt: filter }
        : {};
}

function reportKey(date, group = 'day') {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: process.env.REPORT_TIMEZONE || 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
        .formatToParts(date)
        .reduce(
            (acc, x) => ({ ...acc, [x.type]: x.value }),
            {}
        );

    if (group === 'year') {
        return parts.year;
    }

    if (group === 'month') {
        return `${parts.year}-${parts.month}`;
    }

    return `${parts.year}-${parts.month}-${parts.day}`;
}

function orderFinancials(order) {
    const revenue = order.status === 'cancelled'
        ? 0
        : Number(order.total || 0);

    const profit = order.status === 'cancelled'
        ? 0
        : order.items.reduce(
            (sum, item) =>
                sum +
                (
                    Number(item.price || 0) -
                    Number(item.costPrice || 0)
                ) * Number(item.quantity || 0),
            0
        );

    const units = order.status === 'cancelled'
        ? 0
        : order.items.reduce(
            (sum, item) => sum + Number(item.quantity || 0),
            0
        );

    return { revenue, profit, units };
}

router.post('/', protect, async (req, res) => {
    try {
        const {
            shippingAddress,
            items,
            paymentMethod
        } = req.body || {};

        const customer = {
            name: req.user.name,
            email: req.user.email,
            phone: String(
                req.body?.customer?.phone || ''
            ).trim()
        };

        if (!customer.name || !customer.email || !customer.phone) {
            return res.status(400).json({
                message: 'Please provide your phone number and complete your account details.'
            });
        }

        if (
            !shippingAddress?.address ||
            !shippingAddress?.city ||
            !shippingAddress?.state ||
            !shippingAddress?.pincode
        ) {
            return res.status(400).json({
                message: 'Complete your delivery address.'
            });
        }

        if (
            !Array.isArray(items) ||
            items.length < 1 ||
            items.length > 50
        ) {
            return res.status(400).json({
                message: 'Your cart is empty or contains too many items.'
            });
        }

        if (paymentMethod && paymentMethod !== 'cod') {
            return res.status(400).json({
                message: 'Cash on Delivery is currently the only enabled payment method.'
            });
        }

        const ids = items
            .map(item => String(item.productId || ''))
            .filter(id => mongoose.isValidObjectId(id));

        const dbProducts = ids.length
            ? await Product.find({
                _id: { $in: ids }
            }).lean()
            : [];

        const productMap = new Map(
            dbProducts.map(p => [String(p._id), p])
        );

        const cleanItems = items.map(item => {
            const dbProduct = productMap.get(
                String(item.productId || '')
            );

            const price = dbProduct
                ? Number(dbProduct.price)
                : Number(item.price);

            const quantity = Number(item.quantity);

            if (
                !item.name ||
                !Number.isFinite(price) ||
                price < 0 ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > 99
            ) {
                throw new Error(
                    'One or more cart items are invalid.'
                );
            }

            return {
                productId: String(item.productId || ''),
                name: String(
                    dbProduct?.name || item.name
                ).slice(0, 180),
                image: String(
                    dbProduct?.image || item.image || ''
                ).slice(0, 2000),
                category: String(
                    dbProduct?.category || item.category || ''
                ).slice(0, 100),
                price,
                costPrice: Number(dbProduct?.costPrice || 0),
                quantity
            };
        });

        const subtotal = cleanItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const shippingFee = subtotal >= 5000 ? 0 : 150;

        const order = await Order.create({
            user: req.user._id,
            customer,
            shippingAddress,
            items: cleanItems,
            subtotal,
            shippingFee,
            total: subtotal + shippingFee,
            paymentMethod: 'cod',
            status: 'placed',
            statusHistory: [
                {
                    status: 'placed',
                    note: 'Order placed successfully'
                }
            ]
        });

        res.status(201).json({
            message: 'Order placed successfully.',
            order: {
                _id: order._id,
                orderNumber: order.orderNumber,
                total: order.total,
                status: order.status
            }
        });

    } catch (error) {
        res.status(400).json({
            message: error.message || 'Could not place your order.'
        });
    }
});

router.get('/my', protect, async (req, res) => {
    try {
        const limit = Math.min(
            Math.max(Number(req.query.limit) || 50, 1),
            100
        );

        const orders = await Order.find({
            user: req.user._id
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        res.json({ orders });

    } catch {
        res.status(500).json({
            message: 'Could not load your orders.'
        });
    }
});

router.get('/my/:id', protect, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user._id
        }).lean();

        if (!order) {
            return res.status(404).json({
                message: 'Order not found.'
            });
        }

        res.json({ order });

    } catch {
        res.status(400).json({
            message: 'Invalid order ID.'
        });
    }
});

router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(1000)
            .lean();

        res.json({ orders });

    } catch {
        res.status(500).json({
            message: 'Could not load orders.'
        });
    }
});

router.patch(
    '/admin/:id/status',
    protect,
    adminOnly,
    async (req, res) => {
        const status = req.body.status;

        if (!STATUSES.includes(status)) {
            return res.status(400).json({
                message: 'Invalid order status.'
            });
        }

        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({
                    message: 'Order not found.'
                });
            }

            if (order.status !== status) {
                order.status = status;

                order.statusHistory.push({
                    status,
                    note: `Order status changed to ${status}`
                });

                await order.save();
            }

            res.json({ order });

        } catch {
            res.status(400).json({
                message: 'Could not update order.'
            });
        }
    }
);

router.get(
    '/admin/analytics',
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const group = [
                'day',
                'month',
                'year'
            ].includes(req.query.group)
                ? req.query.group
                : 'day';

            const filter = dateFilter(
                req.query.from,
                req.query.to
            );

            const [orders, registeredCustomers] =
                await Promise.all([
                    Order.find(filter)
                        .sort({ createdAt: 1 })
                        .lean(),

                    User.countDocuments({
                        role: 'customer',
                        ...dateFilter(
                            req.query.from,
                            req.query.to
                        )
                    })
                ]);

            const activeOrders = orders.filter(
                o => o.status !== 'cancelled'
            );

            const purchasingCustomers = new Set(
                activeOrders.map(o => String(o.user))
            ).size;

            const cancelledOrders = orders.filter(
                o => o.status === 'cancelled'
            ).length;

            const totals = activeOrders.reduce(
                (acc, order) => {
                    const f = orderFinancials(order);

                    acc.revenue += f.revenue;
                    acc.profit += f.profit;
                    acc.units += f.units;

                    return acc;
                },
                {
                    revenue: 0,
                    profit: 0,
                    units: 0
                }
            );

            const seriesMap = new Map();

            for (const order of orders) {
                const key = reportKey(order.createdAt, group);

                if (!seriesMap.has(key)) {
                    seriesMap.set(key, {
                        period: key,
                        customers: new Set(),
                        orders: 0,
                        units: 0,
                        revenue: 0,
                        profit: 0
                    });
                }

                const row = seriesMap.get(key);

                row.customers.add(String(order.user));

                if (order.status !== 'cancelled') {
                    const f = orderFinancials(order);

                    row.orders += 1;
                    row.units += f.units;
                    row.revenue += f.revenue;
                    row.profit += f.profit;
                }
            }

            const series = [...seriesMap.values()]
                .sort((a, b) =>
                    a.period.localeCompare(b.period)
                )
                .map(row => ({
                    ...row,
                    customers: row.customers.size
                }));

            res.json({
                filters: {
                    from: req.query.from || '',
                    to: req.query.to || '',
                    group
                },

                summary: {
                    registeredCustomers,
                    purchasingCustomers,
                    totalOrders: activeOrders.length,
                    cancelledOrders,
                    unitsSold: totals.units,
                    revenue: totals.revenue,
                    profit: totals.profit
                },

                series
            });

        } catch (e) {
            console.error(e);

            res.status(500).json({
                message: 'Could not calculate analytics.'
            });
        }
    }
);

function xlsEscape(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

router.get(
    '/admin/export',
    protect,
    adminOnly,
    async (req, res) => {
        try {
            const group = [
                'day',
                'month',
                'year'
            ].includes(req.query.group)
                ? req.query.group
                : 'day';

            const orders = await Order.find(
                dateFilter(req.query.from, req.query.to)
            )
                .sort({ createdAt: -1 })
                .lean();

            const active = orders.filter(
                o => o.status !== 'cancelled'
            );

            const totals = active.reduce(
                (acc, order) => {
                    const f = orderFinancials(order);

                    acc.revenue += f.revenue;
                    acc.profit += f.profit;
                    acc.units += f.units;

                    return acc;
                },
                {
                    revenue: 0,
                    profit: 0,
                    units: 0
                }
            );

            const rows = orders.map(o => `
                <tr>
                    <td>${xlsEscape(o.orderNumber)}</td>
                    <td>${xlsEscape(
                        o.createdAt?.toISOString?.() || o.createdAt
                    )}</td>
                    <td>${xlsEscape(o.customer?.name)}</td>
                    <td>${xlsEscape(o.customer?.email)}</td>
                    <td>${xlsEscape(o.customer?.phone)}</td>
                    <td>${xlsEscape(o.status)}</td>
                    <td>${xlsEscape(o.paymentMethod)}</td>
                    <td>${Number(o.subtotal || 0)}</td>
                    <td>${Number(o.shippingFee || 0)}</td>
                    <td>${Number(o.total || 0)}</td>
                    <td>${orderFinancials(o).units}</td>
                    <td>${orderFinancials(o).profit}</td>
                </tr>
            `).join('');

            const summaryRows = `
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                </tr>
                <tr>
                    <td>Total orders</td>
                    <td>${active.length}</td>
                </tr>
                <tr>
                    <td>Units sold</td>
                    <td>${totals.units}</td>
                </tr>
                <tr>
                    <td>Total revenue</td>
                    <td>${totals.revenue}</td>
                </tr>
                <tr>
                    <td>Total profit</td>
                    <td>${totals.profit}</td>
                </tr>
            `;

            const html = `
                <html>
                    <head>
                        <meta charset="UTF-8">
                    </head>
                    <body>
                        <h2>SP FASHION Analytics (${xlsEscape(group)})</h2>

                        <table border="1">
                            <tbody>
                                ${summaryRows}
                            </tbody>
                        </table>

                        <br/>

                        <table border="1">
                            <thead>
                                <tr>
                                    <th>Order Number</th>
                                    <th>Date</th>
                                    <th>Customer</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Payment</th>
                                    <th>Subtotal</th>
                                    <th>Shipping</th>
                                    <th>Total</th>
                                    <th>Units</th>
                                    <th>Profit</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                    </body>
                </html>
            `;

            const filename =
                `sp-fashion-analytics-${req.query.from || 'all'}-${req.query.to || 'time'}.xls`;

            res.setHeader(
                'Content-Type',
                'application/vnd.ms-excel; charset=utf-8'
            );

            res.setHeader(
                'Content-Disposition',
                `attachment; filename="${filename}"`
            );

            res.send(html);

        } catch (e) {
            console.error(e);

            res.status(500).json({
                message: 'Could not export analytics.'
            });
        }
    }
);

module.exports = router;
