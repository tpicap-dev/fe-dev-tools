export default abstract class PlanStepForm {
  static wrapper = document.createElement('div')
  static field = document.createElement('input')
  static button = document.createElement('button')
  static eventTypes = {
    PLAN_STEP: 'DemoTools:Steps:PlanStepForm:PlanStep',
  }

  static getForm() {
    PlanStepForm.wrapper.style.display = 'flex'
    PlanStepForm.wrapper.style.gap = '5px'
    PlanStepForm.wrapper.style.padding = '5px'
    PlanStepForm.button.innerText = 'Add'
    PlanStepForm.button.addEventListener('click', PlanStepForm.handleAddClick)
    PlanStepForm.field.addEventListener('keypress',PlanStepForm.handleKeypress)
    PlanStepForm.wrapper.appendChild(PlanStepForm.field)
    PlanStepForm.wrapper.appendChild(PlanStepForm.button)
    return PlanStepForm.wrapper
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

}