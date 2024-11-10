const _ = (id) => document.getElementById(id)

document.addEventListener('DOMContentLoaded', {})

const ctx = _('myChart')

function resetHelpingCalcForm() {
  _('helpingCalcForm').reset()
  calcDrop2.setAttribute('disabled', true)
  _('calcInput2').setAttribute('disabled', true)
  _('calcResultValue').textContent = ''
  _('calcResultCategory').textContent = ''
}

function resetGeneralPlanInfoForm() {
  _('generalPlanInfoForm').reset()
}

function onChangeCalcDrop1(e) {
  if (e.value === '') return
  const calcDrop2 = _('calcDrop2')
  const arr = [
    'Wybierz z listy...',
    'Ilość dni',
    'Ilość pracowników (dziennie)',
    'Ilość płanowana (1pr/1dź)',
  ]
  calcDrop2.innerHTML = arr
    .filter((v) => v !== e.value)
    .map((v, i) => {
      return i === 0
        ? `<option selected disabled value="">${v}</option>`
        : `<option value="${v}">${v}</option>`
    })
    .join('')
  calcDrop2.removeAttribute('disabled')
  _('calcInput2').removeAttribute('disabled')
  _('calcInput1').value = ''
  _('calcInput2').value = ''
  _('calcResultValue').textContent = ''
  _('calcResultCategory').textContent = ''
}

function calculateHelpingResult(e) {
  numberInputPattern(e)
  const calcInput1 = _('calcInput1').value
  const calcInput2 = _('calcInput2').value
  if (calcInput1 && calcInput2) {
    _('calcResultValue').textContent = (
      15000 /
      calcInput1 /
      calcInput2
    ).toFixed(2)
  }
}

function numberInputPattern(e) {
  e.value = e.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
}

function setHelpingCategory() {
  _('calcResultCategory').textContent = [
    'Ilość dni',
    'Ilość pracowników (dziennie)',
    'Ilość płanowana (1pr/1dź)',
  ].filter((v) => v !== _('calcDrop1').value && v !== _('calcDrop2').value)[0]
  _('calcInput2').value = ''
  _('calcResultValue').textContent = ''
}

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['5 wrz', '6 wrz', '7 wrz', '8 wrz', '9 wrz', '10 wrz', '11 wrz'],
    datasets: [
      {
        label: 'Plan',
        data: [65, 120, 155, 186, 220, 268, 300],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        type: 'bar',
        label: 'Zasoby plan',
        data: [6, 7, 6, 5, 7, 7, 7],
        backgroundColor: 'rgb(75, 192, 192)',
      },
    ],
  },
  options: {
    animations: {
      tension: {
        duration: 500,
        easing: 'easeOutBounce',
        from: 1,
        to: 0,
      },
    },
  },
})
