import message from '../../data/messages.json'

const JS_HOOK_REMOVE = '[js-hook-form-remove]'
const JS_HOOK_FORM_REMOVE_BUTTON = '[js-hook-form-remove-button]'
const JS_HOOK_OVERLAY = '[js-hook-overlay]'
const JS_HOOK_MODAL = '[js-hook-modal]'
const JS_HOOK_MODAL_CONTENT = '[js-hook-modal-content]'

const CLASS_IS_TRANSITIONING = 'remove--is-transitioning'
const CLASS_OVERLAY_IS_ACTIVE = 'overlay--is-active'
const CLASS_MODAL_IS_ACTIVE = 'modal--is-active'

class Remove {
  constructor(element) {
    this.form = element
    this.button = document.querySelector(JS_HOOK_FORM_REMOVE_BUTTON)
    this.overlay = document.querySelector(JS_HOOK_OVERLAY)
    this.modal = document.querySelector(JS_HOOK_MODAL)
    this.modalContent = document.querySelector(JS_HOOK_MODAL_CONTENT)
    this.bindEvents()
  }
  bindEvents() {
    this.button.addEventListener('click', () => this.formHandler(event))
  }

  formHandler(event) {
    event.preventDefault()

    const buttonName = event.target.parentNode.name
      ? event.target.parentNode.name
      : event.target.name
    const buttonValue = event.target.parentNode.value
      ? event.target.parentNode.value
      : event.target.value

    this.postRequest(buttonName, buttonValue)
  }

  async postRequest(key, value) {
    try {
      const values = { [key]: value }

      const config = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(values),
      }

      const response = await fetch('/remove-match', config)
      const data = await response.json()

      if (data) {
        const element = this.form.closest(JS_HOOK_REMOVE)

        if (data.avatar && data.username) {
          const html = `
            <h2 class="modal__title">So sad things didn't work out..</h2>
            <p class="modal__description">Hopefully the someone else will be your soulmate! You succesfully removed ${data.username}</p>
            <div class="modal__image-wrapper">
             <img class="modal__image" src="${data.avatar}" alt="${data.username}">
            </div>
            <a class="c-button--primary modal__button-close" href="/home" aria-label="Close modalbox">
              <span class="button__label">Okay!</span>
            </a>
          `

          while (this.modalContent.firstChild)
            this.modalContent.removeChild(this.modalContent.firstChild)

          this.modalContent.insertAdjacentHTML('afterbegin', html)
          this.showModal()
        }

        element.classList.add(CLASS_IS_TRANSITIONING)
        element.addEventListener('transitionend', () => {
          element.remove()

          if (!this.matchWrapper.children.length) {
            this.matchWrapper.insertAdjacentHTML('afterbegin', message.noResults)
          }
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  showModal() {
    this.overlay.classList.add(CLASS_OVERLAY_IS_ACTIVE)
    this.modal.classList.add(CLASS_MODAL_IS_ACTIVE)
  }
}

export default Remove
