const validate = require("../validation/validator")
const productModel = require("../model/productModel")
const reviewModel = require('../model/reviewModel')
const moment = require('moment')

const createReview = async function (req, res) {
    try {

        const requestBody = req.body;
        const productId = req.params.productId
        const product = await productModel.findOne({ _id: productId, isDeleted: false, deletedAt: null });
        
        if (!validate.isValidRequestBody(requestBody)) {
            res.status(400).send({ status: false, message: 'Invalid parameters!!. Please provide review details' })
            return
        }
        if(!validate.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is an invalid product id` })
        }
        if (!product) {
            res.status(400).send({ status: false, message: `productId does not exists` })
            return
        }
        const { reviewedBy, review, rating ,reviewedAt } = requestBody;
        if (!validate.isValidObjectId(productId)) {
            res.status(400).send({ status: false, message: ' please provide valid productId ' })
            return
        }

        if (!validate.isValid(rating)) {
            res.status(400).send({ status: false, message: ' Please provide a valid rating' })
            return
        }
        
        if (!validate.validateRating(rating)) {
            res.status(400).send({ status: false, message: 'rating should be between 1 to 5 integers' })
            return
        }     
        if (!validate.isValid(review)) {
            res.status(400).send({ status: false, message: ' Please provide a review' })
            return
        }
        if(!validate.isValid(reviewedAt)) {
            return res.status(400).send({ status: false, message: `Review date is required`})
        }

        if(!validate.isValidDate(reviewedAt)) {
            return res.status(400).send({ status: false, message: `${reviewedAt} is an invalid date`})
        }

        const newReview = await reviewModel.create( {
            productId: productId,
            reviewedBy: reviewedBy ? reviewedBy : "Guest",
            reviewedAt: moment(reviewedAt).toISOString(),
            rating: rating,
            review: review

        })

        product.reviews = product.reviews + 1
        await product.save()

        const data = product.toObject()
        data['reviewsData'] = newReview
        res.status(201).send({ status: true, message: 'review added successfully for this productId', data: data })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message });
    }
}

module.exports ={createReview}