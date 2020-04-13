import debounce from 'debounce'
import noUiSlider from 'nouislider'
import validator from 'validator'
import wNumb from 'wnumb'

import cityLocations from '../../data/cityLocations.json'
import message from '../../data/messages.json'

const JS_HOOK_NEXT_BUTTON = '[js-hook-next-button]'
const JS_HOOK_INPUT_NAME = '[js-hook-input-name]'
const JS_HOOK_INPUT_LOCATION = '[js-hook-input-location]'
const JS_HOOK_INPUT_SUGGESTIONS = '[js-hook-input-suggestions]'
const JS_HOOK_GEO_API_LOCATION = '[js-hook-geo-api-location]'
const JS_HOOK_INPUT_AGE = '[js-hook-input-age]'
const JS_HOOK_INPUT_AGE_RANGE = '[js-hook-input-age-range]'
const JS_HOOK_SUBMIT_BUTTON = '[js-hook-submit-button]'
const JS_HOOK_LEVEL_FORM = '[js-hook-level-form]'
const JS_HOOK_INPUT_FILE = '[js-hook-input-file]'
const JS_HOOK_RANGE_FROM = '[js-hook-range-from]'
const JS_HOOK_RANGE_TO = '[js-hook-range-to]'
const JS_HOOK_INPUT_SONG = '[js-hook-input-song]'
const JS_HOOK_INPUT_ARTIST = '[js-hook-input-artist]'
const JS_HOOK_SELECT_GENRE = '[js-hook-select-genre]'
const JS_HOOK_FORM_SETTINGS_PE = '[js-hook-form-settings-pe]'
const JS_HOOK_NOTIFICATION = '[js-hook-notification]'
const JS_HOOK_NOTIFICATION_MESSAGE = '[js-hook-notification-message]'

const CLASS_INPUT_IS_VISIBLE = 'form__item--is-visible'
const CLASS_UTILITY_IS_INVISIBLE = 'u--is-hidden'
const CLASS_FORM_ITEM = 'form__item'
const CLASS_FORM_PE = 'form__settings--pe'
const CLASS_NOTIFICATION_IS_ACTIVE = 'notification--is-active'

const RADIO_INPUT_GENDER = 'gender'
const RADIO_INPUT_ATTRACTION = 'attraction'

class FormSettings {
  constructor(element) {
    this.form = element
    this.inputName = element.querySelector(JS_HOOK_INPUT_NAME)
    this.inputLocation = element.querySelector(JS_HOOK_INPUT_LOCATION)
    this.geoLocation = element.querySelector(JS_HOOK_GEO_API_LOCATION)
    this.inputSuggestions = element.querySelector(JS_HOOK_INPUT_SUGGESTIONS)
    this.inputAge = element.querySelector(JS_HOOK_INPUT_AGE)
    this.inputAgeRange = element.querySelector(JS_HOOK_INPUT_AGE_RANGE)
    this.levelForm = element.querySelector(JS_HOOK_LEVEL_FORM)
    this.fileUpload = element.querySelector(JS_HOOK_INPUT_FILE)
    this.inputRangeFrom = element.querySelector(JS_HOOK_RANGE_FROM)
    this.inputRangeTo = element.querySelector(JS_HOOK_RANGE_TO)
    this.inputSong = element.querySelector(JS_HOOK_INPUT_SONG)
    this.inputArtist = element.querySelector(JS_HOOK_INPUT_ARTIST)
    this.selectGenre = element.querySelector(JS_HOOK_SELECT_GENRE)
    this.pe = element.querySelector(JS_HOOK_FORM_SETTINGS_PE)
    this.notification = document.querySelector(JS_HOOK_NOTIFICATION)
    this.notificationMessage = document.querySelector(JS_HOOK_NOTIFICATION_MESSAGE)
    this.genderInputs = document.getElementsByName(RADIO_INPUT_GENDER)
    this.attractionInputs = document.getElementsByName(RADIO_INPUT_ATTRACTION)

    this.inputRanges = [this.inputRangeFrom, this.inputRangeTo]
    this.formItems = [...element.querySelectorAll('.' + CLASS_FORM_ITEM)]

    this.nextButton = document.querySelector(JS_HOOK_NEXT_BUTTON)
    this.submitButton = document.querySelector(JS_HOOK_SUBMIT_BUTTON)
    this.textInputs = [this.inputName, this.inputAge, this.inputSong, this.inputArtist]

    this.initialLoadEvents()
    this.bindEvents()
  }

  initialLoadEvents() {
    this.nextButton.classList.remove(CLASS_UTILITY_IS_INVISIBLE)
    this.submitButton.classList.add(CLASS_UTILITY_IS_INVISIBLE)
    this.geoLocation.classList.remove(CLASS_UTILITY_IS_INVISIBLE)
    this.pe.classList.remove(CLASS_FORM_PE)

    this.inputRangeFrom.setAttribute('readonly', '')
    this.inputRangeTo.setAttribute('readonly', '')

    if (this.inputName.value.length < 2) {
      this.disableButton(this.nextButton)
    }

    for (const [i, item] of this.formItems.entries()) {
      if (i !== 0) item.classList.remove(CLASS_INPUT_IS_VISIBLE)
    }

    noUiSlider.create(this.inputAgeRange, {
      start: [18, 30],
      connect: true,
      tooltips: true,
      step: 1,
      range: {
        min: 18,
        max: 99,
      },
      format: wNumb({
        decimals: 0,
      }),
    })
  }

  bindEvents() {
    this.form.addEventListener('submit', () => this.validationEvents(event))
    this.nextButton.addEventListener('click', () => this.formHandler())
    this.inputName.addEventListener(
      'keydown',
      debounce(element => {
        this.enableButton(element)
      }, 200),
    )
    this.inputAge.addEventListener(
      'keydown',
      debounce(element => {
        this.enableButton(element)
      }, 200),
    )
    this.inputLocation.addEventListener(
      'input',
      debounce(element => {
        this.setLocationSuggestions(element)
      }, 200),
    )
    this.geoLocation.addEventListener(
      'click',
      debounce(element => {
        this.getGeoLocation(element)
      }, 200),
    )

    for (const input of this.textInputs) {
      input.addEventListener(
        'keydown',
        debounce(element => {
          this.enableButton(element)
        }, 200),
      )
    }

    this.fileUpload.addEventListener('change', () => this.formHandler())

    this.inputAgeRange.noUiSlider.on('update', (values, handle) =>
      this.updateRangeInputValues(values, handle),
    )
  }

  formHandler() {
    this.closeNotification()

    const disabledArray = [1, 6, 7]

    for (const [i, item] of this.formItems.entries()) {
      if (!item.classList.contains(CLASS_INPUT_IS_VISIBLE)) {
        const itemInput = getInputFromParent(item)

        item.classList.add(CLASS_INPUT_IS_VISIBLE)

        if (itemInput) itemInput.focus()

        for (const index of disabledArray) {
          if (i === index) {
            setTimeout(() => {
              if (!this.nextButton.hasAttribute('disabled')) {
                this.nextButton.setAttribute('disabled', '')
              }
            }, 0)
          }
        }

        if (item.classList.contains('c-radio')) {
          const itemLabels = getInputsFromParent(item)

          this.nextButton.setAttribute('disabled', '')

          for (const label of itemLabels) {
            label.addEventListener('click', () => this.formHandler())
          }
        } else if (item.classList.contains('input--file')) {
          this.nextButton.setAttribute('disabled', '')
        } else {
          if (this.nextButton.hasAttribute('disabled')) {
            this.nextButton.removeAttribute('disabled')
          }
        }

        if (i === this.formItems.length - 1) {
          this.nextButton.classList.add(CLASS_UTILITY_IS_INVISIBLE)

          if (this.submitButton.classList.contains(CLASS_UTILITY_IS_INVISIBLE)) {
            this.selectGenre.addEventListener('change', () => this.enableSubmit())
          }
        }

        return this.scrollToBottom()
      }
    }
  }

  updateRangeInputValues(values, handle) {
    this.inputRanges[handle].value = values[handle]
  }

  scrollToBottom() {
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: 'smooth' })
  }

  enableButton(element) {
    const elementLength = element.srcElement.value.length

    if (elementLength >= 2 && this.nextButton.hasAttribute('disabled')) {
      this.nextButton.removeAttribute('disabled')
    }

    if (elementLength < 2 && !this.nextButton.hasAttribute('disabled')) {
      this.disableButton()
    }
  }

  disableButton(element) {
    element.setAttribute('disabled', '')
  }

  enableSubmit() {
    this.submitButton.classList.remove(CLASS_UTILITY_IS_INVISIBLE)

    return this.scrollToBottom()
  }

  validationEvents(event) {
    event.preventDefault()

    const name = this.inputName.value
    const age = this.inputAge.value

    // Validate name length
    if (!validator.isByteLength(name, { min: 2, max: 256 })) {
      return this.errorHandler(message.nameCheck)
    }

    // Check if name contains only letters
    if (!validator.isAlpha(name)) {
      return this.errorHandler(message.nameLetters)
    }

    // Validate age length
    if (!validator.isByteLength(age, { min: 2, max: 2 })) {
      return this.errorHandler(message.ageCheck)
    }

    // Check if age contains only letters
    if (!validator.isNumeric(age)) {
      return this.errorHandler(message.ageLetters)
    }

    // Check if one (gender) radio button is checked
    if (this.genderInputs) {
      const trueCount = this.getRadioCount(this.genderInputs)

      if (trueCount !== 1) {
        return this.errorHandler(message.chooseGender)
      }
    }

    // Check if one (attraction) radio button is checked
    if (this.attractionInputs) {
      const trueCount = this.getRadioCount(this.attractionInputs)

      if (trueCount !== 1) {
        return this.errorHandler(message.chooseAttraction)
      }
    }

    // Check if upload contains a valid image
    if (this.fileUpload) {
      if (this.fileUpload.files[0]) {
        const file = this.fileUpload.files[0]
        const pattern = /image-*/

        if (!file.type.match(pattern)) {
          return this.errorHandler(message.setRealImage)
        }
      } else {
        return this.errorHandler(message.setAvatar)
      }
    }

    this.submitForm()
  }

  errorHandler(message) {
    this.notificationMessage.textContent = message
    this.notification.classList.add(CLASS_NOTIFICATION_IS_ACTIVE)
  }

  closeNotification() {
    if (this.notification.classList.contains(CLASS_NOTIFICATION_IS_ACTIVE)) {
      this.notification.classList.remove(CLASS_NOTIFICATION_IS_ACTIVE)
    }
  }

  getRadioCount(element) {
    let trueCount = 0

    for (const input of element) {
      if (input.checked === true) {
        trueCount++
      }
    }

    return trueCount
  }

  setLocationSuggestions(element) {
    const value = element.target.value.toLowerCase()
    // converts input to Uppercase first word letters

    const findMatchingCityResults = value => {
      return cityLocations.filter(item => item.woonplaats.toLowerCase().includes(value))
    }
    const maxFiveMatchingResults = findMatchingCityResults(value).slice(0, 5)

    if (value.length >= 2 && maxFiveMatchingResults.length) {
      console.log(maxFiveMatchingResults)
      this.inputSuggestions.innerHTML = ''

      maxFiveMatchingResults.forEach(item => {
        console.log(item)
        this.inputSuggestions.insertAdjacentHTML(
          'beforeend',
          `<label class="" for="${item.woonplaats}">
            <span class="form__radio-title">${item.woonplaats}</span>
            <input class="form__radio" type="radio" name="inputSuggestion" id="${item.woonplaats}" value="${item.woonplaats}">
          </label>`,
        )
      })
    }
  }

  async getGeoLocation(element) {
    this.inputLocation.disabled = true
    element.target.disabled = true
    element.target.innerText = 'Getting personal location'

    // waits for GEO location api to resolve promise
    const data = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })
    const { latitude, longitude } = data.coords
    const location = JSON.stringify({ latitude, longitude })

    this.geoLocation.insertAdjacentHTML(
      'afterend',
      `<input type=hidden value='` + location + `' name="geoLocation">`,
    )

    element.target.innerText = 'Location retreived'
  }

  submitForm() {
    this.form.submit()
  }
}

const getInputFromParent = element => element.querySelector('input')
const getInputsFromParent = element => [...element.querySelectorAll('input')]

export default FormSettings
