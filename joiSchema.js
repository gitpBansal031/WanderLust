const joi = require("joi");
const reviewSchema = joi.object({
    review: joi.object({
        rating: joi.number().required(),
        comment: joi.string().required()
    }).required()
})

module.exports = { joi };