// import debounce from 'debounce'
import noUiSlider from 'nouislider'
import validator from 'validator'
import wNumb from 'wnumb'

import message from '../../data/messages.json'

const JS_HOOK_INPUT_NAME = '[js-hook-input-name]'
const JS_HOOK_INPUT_AGE = '[js-hook-input-age]'
const JS_HOOK_INPUT_AGE_RANGE = '[js-hook-input-age-range]'
const JS_HOOK_RANGE_FROM = '[js-hook-range-from]'
const JS_HOOK_RANGE_TO = '[js-hook-range-to]'
const JS_HOOK_SUBMIT_BUTTON = '[js-hook-submit-button]'
const JS_HOOK_NOTIFICATION = '[js-hook-notification]'
const JS_HOOK_NOTIFICATION_MESSAGE = '[js-hook-notification-message]'

const CLASS_FORM_ITEM = 'form__item'
const CLASS_NOTIFICATION_IS_ACTIVE = 'notification--is-active'

const RADIO_INPUT_GENDER = 'gender'
const RADIO_INPUT_ATTRACTION = 'attraction'

class FormProfile {
  constructor(element) {
    this.form = element
    this.inputName = element.querySelector(JS_HOOK_INPUT_NAME)
    this.inputAge = element.querySelector(JS_HOOK_INPUT_AGE)
    this.inputAgeRange = element.querySelector(JS_HOOK_INPUT_AGE_RANGE)
    this.inputRangeFrom = element.querySelector(JS_HOOK_RANGE_FROM)
    this.inputRangeTo = element.querySelector(JS_HOOK_RANGE_TO)
    this.notification = document.querySelector(JS_HOOK_NOTIFICATION)
    this.notificationMessage = document.querySelector(JS_HOOK_NOTIFICATION_MESSAGE)
    this.genderInputs = document.getElementsByName(RADIO_INPUT_GENDER)
    this.attractionInputs = document.getElementsByName(RADIO_INPUT_ATTRACTION)

    this.inputRanges = [this.inputRangeFrom, this.inputRangeTo]
    this.formItems = [...element.querySelectorAll('.' + CLASS_FORM_ITEM)]

    this.submitButton = document.querySelector(JS_HOOK_SUBMIT_BUTTON)
    this.textInputs = [this.inputName, this.inputAge, this.inputSong, this.inputArtist]

    this.initialLoadEvents()
    this.bindEvents()
  }

  initialLoadEvents() {
    this.inputRangeFrom.setAttribute('readonly', '')
    this.inputRangeTo.setAttribute('readonly', '')

    if (this.inputName.value.length < 2) {
      this.disableButton(this.nextButton)
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

    this.inputAgeRange.noUiSlider.on('update', (values, handle) =>
      this.updateRangeInputValues(values, handle),
    )
  }

  updateRangeInputValues(values, handle) {
    this.inputRanges[handle].value = values[handle]
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

  submitForm() {
    this.form.submit()
  }
}

export default FormProfile
