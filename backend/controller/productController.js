const validator = require('../validation/validator')

const productModel = require('../model/productModel')

//creating product by validating all details.
const productCreation = async function(req, res) {
    try {
      
        let requestBody = req.body;
     

        //validating empty req body.
     

        //extract params for request body.
        let {
            title,
            description,
            price,
            currencyFormat,
            isFreeShipping,
           
            availableSizes,
            installments
        } = requestBody

        //validation for the params starts.
        if (!validator.isValid(title)) {
            return res.status(400).send({ status: false, message: "Title is required" })
        }

        //searching title in DB to maintain their uniqueness.
        const istitleAleadyUsed = await productModel.findOne({ title })
        if (istitleAleadyUsed) {
            return res.status(400).send({
                status: false,
                message: `${title} is alraedy in use. Please use another title.`
            })
        }

        //uploading product image to AWS.
        // if (files) {
        //     if (validator.isValidRequestBody(files)) {
        //         if (!(files && files.length > 0)) {
        //             return res.status(400).send({ status: false, message: "Please provide product image" })
        //         }
        //         productImage = await config.uploadFile(files[0])
        //     }
        // }

        if (!validator.isValid(description)) {
            return res.status(400).send({ status: false, message: "Description is required" })
        }

        if (!validator.isValid(price)) {
            return res.status(400).send({ status: false, message: "Price is required" })
        }

    

        // if (!validator.isValid(currencyFormat)) {
        //     currencyFormat = currencySymbol('INR')
        // }
        // currencyFormat = currencySymbol('INR') //used currency symbol package to store INR symbol.

     

        if (installments) {
            if (!validator.isValid(installments)) {
                return res.status(400).send({ status: false, message: "installments required" })
            }
        }
     

        if (isFreeShipping) {
            if (!(isFreeShipping != true)) {
                return res.status(400).send({ status: false, message: "isFreeShipping must be a boolean value" })
            }
        }

        //productImage = await config.uploadFile(files[0]);

        //object destructuring for response body.
        const newProductData = {
            title,
            description,
            price,
            currencyFormat,
            isFreeShipping,
         
            availableSizes,
            installments,
            
        }

        //validating sizes to take multiple sizes at a single attempt.
     

            //using array.isArray function to check the value is array or not.
          
        
        const saveProductDetails = await productModel.create(newProductData)
        return res.status(201).send({ status: true, message: "Product added successfully.", data: saveProductDetails })

    } catch (err) {
        return res.status(500).send({
            status: false,
            message: "Error is : " + err
        })
    }
}




//fetch all products.
const productList = async function(req, res) {
    try {
        const filterQuery = { isDeleted: false } //complete object details.
        const queryParams = req.query;

        if (validator.isValidRequestBody(queryParams)) {
            const { size, name, priceGreaterThan, priceLessThan, priceSort } = queryParams;

            //validation starts.
            if (validator.isValid(size)) {
                filterQuery['availableSizes'] = size
            }

            //using $regex to match the subString of the names of products & "i" for case insensitive.
            if (validator.isValid(name)) {
                filterQuery['title'] = {}
                filterQuery['title']['$regex'] = name
                filterQuery['title']['$options'] = 'i'
            }

            //setting price for ranging the product's price to fetch them.
            if (validator.isValid(priceGreaterThan)) {

                if (!(!isNaN(Number(priceGreaterThan)))) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                }
                if (priceGreaterThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                }
                if (!Object.prototype.hasOwnProperty.call(filterQuery, 'price'))
                    filterQuery['price'] = {}
                filterQuery['price']['$gte'] = Number(priceGreaterThan)
                    //console.log(typeof Number(priceGreaterThan))
            }

            //setting price for ranging the product's price to fetch them.
            if (validator.isValid(priceLessThan)) {

                if (!(!isNaN(Number(priceLessThan)))) {
                    return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                }
                if (priceLessThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                }
                if (!Object.prototype.hasOwnProperty.call(filterQuery, 'price'))
                    filterQuery['price'] = {}
                filterQuery['price']['$lte'] = Number(priceLessThan)
                    //console.log(typeof Number(priceLessThan))
            }

            //sorting the products acc. to prices => 1 for ascending & -1 for descending.
            if (validator.isValid(priceSort)) {

                if (!((priceSort == 1) || (priceSort == -1))) {
                    return res.status(400).send({ status: false, message: `priceSort should be 1 or -1 ` })
                }

                const products = await productModel.find(filterQuery).sort({ price: priceSort })
                    // console.log(products)
                if (Array.isArray(products) && products.length === 0) {
                    return res.status(404).send({ productStatus: false, message: 'No Product found' })
                }

                return res.status(200).send({ status: true, message: 'Product list', data2: products })
            }
        }

        const products = await productModel.find(filterQuery)

        //verifying is it an array and having some data in that array.
        if (Array.isArray(products) && products.length === 0) {
            return res.status(404).send({ productStatus: false, message: 'No Product found' })
        }

        return res.status(200).send({ status: true, message: 'Product list', data: products })
    } catch (error) {
        return res.status(500).send({ success: false, error: error.message });
    }
}

module.exports = {  productCreation, productList }