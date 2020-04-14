import fs from 'fs'
import random_name from 'node-random-name'

import musicGenres from '../../data/genres.json'
import User from '../../database/models/user.js'

export const generateRandomUsers = () => {
  const genders = ['male', 'female']

  genders.forEach(gender => {
    const testFolder = `server/assets/uploads/${gender}s/`
    const images = fs
      .readdirSync(testFolder, { withFileTypes: true })
      .filter(item => !item.isDirectory() && item.name !== '.DS_Store')
      .map(item => item.name)

    for (const image of images) {
      setTimeout(() => {
        const randomName = random_name({ first: true, gender: gender })
        const randomAge = Math.floor(Math.random() * 10) + 18
        const randomGenre = musicGenres[Math.floor(Math.random() * musicGenres.length)]
        const randomLocation = {
          latitude: 50 + Math.random() * 3.5,
          longitude: 3 + Math.random() * 3.5,
        }

        const newUser = new User({
          username: randomName,
          password: '123456',
          name: randomName,
          age: randomAge,
          gender: 'Female',
          attraction: 'Males',
          fromAge: 18,
          toAge: 30,
          avatar: `/assets/uploads/${gender}s/${image}`,
          firstVisit: false,
          location: randomLocation,
          genre: randomGenre,
          song: 'Various songs',
          artist: 'Various artists',
        })

        User.findOne({ username: randomName }, (err, result) => {
          if (result === null) {
            newUser.save()
          }
        })
      }, 50)
    }
  })
}
