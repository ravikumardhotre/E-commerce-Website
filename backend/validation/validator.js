const mongoose = require("mongoose")
const moment = require("moment")

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email.trim())
};
const validatePassword = function (password) {
    var re = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]/;
    return re.test(password.trim())
};

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}
const validString = function (value) {
    if (typeof value !== 'string') return false
    if (typeof value === 'string' && value.trim().length === 0) return false //it checks whether the string contain only space or not 
    return true;
}
const validateRating = function (rating) {
    var re = /^[1-5](\[1-5][1-5]?)?$/;
    if (typeof (rating) == 'string') {
        return re.test(rating.trim())
    } else {
        return re.test(rating)
    }
};
const isValidDate = function (value) {
    const validFormats = [
        "DD/MM/YYYY",
        "MM/DD/YYYY",
        "YYYY/MM/DD",
        "DD-MM-YYYY",
        "MM-DD-YYYY",
        "YYYY-MM-DD",
    ]
    return moment(value, validFormats, true).isValid()
}

module.exports = {
    isValid, isValidRequestBody, validateEmail, isValidObjectId,
    validatePassword,validString,validateRating,isValidDate
}
