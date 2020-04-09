const mongoose = require('mongoose')

const festivalSchema = new mongoose.Schema({
  timestamp: Number,
  festivals: [
    {
      genre: String,
      data: {
        festivalName: String,
        description: String,
        startDate: Number,
        location: {
          locationName: String,
          address: String,
          latitude: String,
          longitude: String,
        },
        price: String,
        priceCurrency: String,
      },
    },
  ],
})

module.exports = mongoose.model('Festival', festivalSchema)
