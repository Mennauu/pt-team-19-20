import cron from 'cron'
import puppeteer from 'puppeteer'

import musicGenres from '../../data/genres.json'
import Festival from '../../database/models/festival.js'

// Job starts when clock hits the 0 hour, the 0 minute
const job = cron.job('0 0 * * *', () => {
  setFestivalData()
})

Festival.findOne().then(latestFestival => {
  const latestFestivalUpdate = latestFestival ? Number(latestFestival.timestamp) : null
  const day = 1000 * 60 * 60 * 24
  const isRecentlyUpdated = Date.now() - day < latestFestivalUpdate

  if (!isRecentlyUpdated || !latestFestivalUpdate) {
    setFestivalData()
  }
})

export default job.start()

const setFestivalData = async () => {
  try {
    puppeteer.launch().then(async browser => {
      const page = await browser.newPage()
      let mergedData = []

      for (const [i, genre] of musicGenres.entries()) {
        await page.goto(`https://festivalfans.nl/events/${genre}/`)

        const data = await page.evaluate(() =>
          [...document.querySelectorAll('div.ev2page script')].map(elem => elem.innerText),
        )

        const shortenedData = data.slice(0, 5)

        shortenedData.forEach(entry => {
          const parsedData = JSON.parse(entry)
          const { name: festivalName, description, startDate } = parsedData
          const { name: locationName } = parsedData.location
          const { addressLocality: address } = parsedData.location.address
          const { latitude, longitude } = parsedData.location.geo
          const { price, priceCurrency } = parsedData.offers

          // ISO date to timestamp https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
          const newData = {
            genre: genre,
            data: {
              festivalName,
              description,
              startDate: Date.parse(startDate),
              location: {
                locationName,
                address,
                latitude,
                longitude,
              },
              price,
              priceCurrency,
            },
          }

          mergedData.push(newData)
          return
        })

        // when done with all loops
        if (i + 1 === musicGenres.length) {
          const timestamp = Date.now()

          // delete all old festivals
          Festival.collection.drop()
          const newFestival = new Festival({ timestamp, festivals: mergedData })

          // update new festivals
          newFestival.save()
        }
      }
      await browser.close()
    })
  } catch (error) {
    console.log(error)
  }
}
