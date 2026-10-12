const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        costPrice: {
            type: Number,
            default: 0,
            min: 0
        },

        color: {
            type: String,
            default: 'multi'
        },

        description: {
            type: String,
            default: ''
        },

        stock: {
            type: Number,
            default: 0,
            min: 0
        },

        image: {
            type: String,
            required: true
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

schema.index({
    name: 'text',
    category: 'text',
    description: 'text',
    color: 'text'
});

module.exports = mongoose.model('Product', schema);