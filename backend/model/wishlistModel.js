const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId;


const wishlistSchema = new mongoose.Schema({
    userId: { type: ObjectId, required: true, ref: "User" },

    productId: { type: ObjectId, required: true, ref: "Product" },

    isDeleted: { type: Boolean, default: false },

    deletedAt: { type: Date, default: null },

    createdAt: { type: Date, default: Date.now },

    updatedAt: { type: Date, default: Date.now }
},
    { timestamps: true })


module.exports = mongoose.model('Wishlist', wishlistSchema)

