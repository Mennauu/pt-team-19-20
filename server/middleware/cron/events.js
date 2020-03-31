import puppeteer from 'puppeteer'

// What is a better file/directory to place this in?
export default async function getFestivalData() {
  // Maybe we need to retreive this data from the database in the future...
  const musicGenres = [
    'deephouse',
    'electro',
    'hardcore',
    'hardstyle',
    'house',
    'pop',
    'rb',
    'rock',
    'techno',
    'trance',
    'urban',
  ]

  puppeteer.launch().then(async browser => {
    const page = await browser.newPage()
    let mergedData = []

    for (const [i, genre] of musicGenres.entries()) {
      await page.goto(`https://festivalfans.nl/events/${genre}/`)

      const data = await page.evaluate(() =>
        [...document.querySelectorAll('div.ev2page script')].map(elem => elem.innerText),
      )

      const shortenedData = data.slice(0, 5)

      const convertedData = shortenedData.map(entry => {
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

        return newData
      })
      // I dond't get this working with the spread Syntax
      mergedData.push(convertedData)
      if (i + 1 === musicGenres.length) {
        console.log(mergedData)
        console.log(convertedData)
        console.log(Date.now())
        // MergedData had to be stored in the database
      }
    }
    await browser.close()
  })
}
