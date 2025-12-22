export default abstract class PlanStepForm {
  static area = document.createElement('div')
  static field = document.createElement('input')
  static button = document.createElement('button')
  static eventTypes = {
    PLAN_STEP: 'DemoTools:Steps:PlanStepForm:PlanStep',
  }

  static init() {
    PlanStepForm.setElement()
  }

  static setElement() {
    PlanStepForm.area.style.display = 'flex'
    PlanStepForm.area.style.gap = '5px'
    PlanStepForm.area.style.padding = '5px'
    PlanStepForm.button.innerText = 'Add'
    PlanStepForm.button.addEventListener('click', PlanStepForm.handleAddClick)
    PlanStepForm.field.addEventListener('keypress',PlanStepForm.handleKeypress)
    PlanStepForm.field.style.flex = '1'
    PlanStepForm.area.appendChild(PlanStepForm.field)
    PlanStepForm.area.appendChild(PlanStepForm.button)
  }

  static planStep() {
    window.dispatchEvent(new CustomEvent(PlanStepForm.eventTypes.PLAN_STEP, { detail: { title: PlanStepForm.field.value }}))
    PlanStepForm.field.value = ''
  }

  static handleAddClick(event) {
    PlanStepForm.planStep()
  }

  static handleKeypress(event) {
    if (event.key !== 'Enter') return

    PlanStepForm.planStep()
  }

  static destroy() {
    PlanStepForm.button.removeEventListener('click', PlanStepForm.handleAddClick)
    PlanStepForm.field.removeEventListener('keypress',PlanStepForm.handleKeypress)
  }

}