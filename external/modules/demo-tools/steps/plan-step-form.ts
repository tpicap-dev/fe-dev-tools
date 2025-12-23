export default abstract class PlanStepForm {
  static area = null
  static eventTypes = {
    PLAN_STEP: 'Demo:Steps:PlanStepForm:PlanStep',
  }

  static init() {
    PlanStepForm.setElement()
  }

  static setElement() {
    PlanStepForm.area = document.createElement('div')
    PlanStepForm.area.style.display = 'flex'
    PlanStepForm.area.style.gap = '5px'
    PlanStepForm.area.style.padding = '5px'

    const field = document.createElement('input')
    const button = document.createElement('button')
    button.innerText = 'Add'
    button.addEventListener('click', PlanStepForm.handleAddClick)
    field.addEventListener('keypress',PlanStepForm.handleKeypress)
    field.style.flex = '1'
    PlanStepForm.area.appendChild(field)
    PlanStepForm.area.appendChild(button)
  }

  static planStep() {
    const field = PlanStepForm.area.querySelector('input')
    window.dispatchEvent(new CustomEvent(PlanStepForm.eventTypes.PLAN_STEP, { detail: { title: field.value }}))
    field.value = ''
  }

  static handleAddClick(event) {
    PlanStepForm.planStep()
  }

  static handleKeypress(event) {
    if (event.key !== 'Enter') return

    PlanStepForm.planStep()
  }

  static destroy() {
    PlanStepForm.area.remove()
    PlanStepForm.area = null
  }

}