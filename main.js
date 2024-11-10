const _ = (id) => document.getElementById(id)
const chartJobPlan = _('chartJobPlan')
const chartEmployeesPlan = _('chartEmployeesPlan')
const planDateStart = _('planDateStart')
const planDateEnd = _('planDateEnd')

document.addEventListener('DOMContentLoaded', () => {
  setPlanDatesRange()
})

planDateStart.addEventListener('change', (e) => {
  const value = e.target.value
  if (value === '' || value.startsWith(0)) return
  planDateEnd.value = value
  const datesDifference = getDaysDifference(value)
  setPlanEndDatesRange(datesDifference, datesDifference + 366)
  setDaysQuantity()
})

planDateEnd.addEventListener('change', (e) => {
  const value = e.target.value
  if (value === '' || value.startsWith(0)) return
  setDaysQuantity()
})

function setDaysQuantity() {
  let ds = planDateStart.value
  let de = planDateEnd.value
  if (ds === '' || de === '' || de.startsWith(0) || ds.startsWith(0)) return
  const daysBetween = {
    allDays: 0,
    workDays: 0,
  }
  while (ds !== de) {
    daysBetween.allDays++
    if (new Date(ds).getDay() !== 0) daysBetween.workDays++
    ds = new Date(new Date(ds).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/T.+/g, '')
  }
  daysBetween.allDays++
  if (new Date(ds).getDay() !== 0) daysBetween.workDays++
  _('planDaysTotal').textContent = daysBetween.allDays.toString()
  _('planDaysWork').textContent = `${daysBetween.workDays.toString()})`
}

function getDaysDifference(value) {
  const diff = parseInt((new Date(value).getTime() - Date.now()) / 86_400_000)
  return diff > 0 ? 1 + diff : diff
}

function setPlanDatesRange() {
  setPlanStartDatesRange()
  setPlanEndDatesRange()
}

function setPlanStartDatesRange(
  daysFromTodayForMin = -31,
  daysFromTodayForMax = 365
) {
  planDateStart.setAttribute(
    'min',
    new Date(Date.now() + daysFromTodayForMin * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/T.+/g, '')
  )
  planDateStart.setAttribute(
    'max',
    new Date(Date.now() + daysFromTodayForMax * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/T.+/g, '')
  )
}

function setPlanEndDatesRange(
  daysFromTodayForMin = -30,
  daysFromTodayForMax = 366
) {
  planDateEnd.setAttribute(
    'min',
    new Date(Date.now() + daysFromTodayForMin * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/T.+/g, '')
  )
  planDateEnd.setAttribute(
    'max',
    new Date(Date.now() + daysFromTodayForMax * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/T.+/g, '')
  )
}

function resetHelpingCalcForm() {
  _('helpingCalcForm').reset()
  calcDrop2.setAttribute('disabled', true)
  _('calcInput2').setAttribute('disabled', true)
  _('calcResultValue').textContent = ''
  _('calcResultCategory').textContent = ''
}

function resetGeneralPlanInfoForm() {
  _('generalPlanInfoForm').reset()
  _('planDaysTotal').textContent = '0'
  _('planDaysWork').textContent = '0)'
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
  floatInputPattern(e)
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

function floatInputPattern(e) {
  e.value = e.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
}

function intInputPattern(e) {
  e.value = e.value.replace(/\D/g, '')
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

new Chart(chartJobPlan, {
  type: 'line',
  data: {
    labels: ['5 wrz', '6 wrz', '7 wrz', '8 wrz', '9 wrz', '10 wrz', '11 wrz'],
    datasets: [
      {
        label: 'Plan wykonywania',
        data: [65, 120, 155, 186, 220, 268, 300],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
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

new Chart(chartEmployeesPlan, {
  type: 'line',
  data: {
    labels: ['5 wrz', '6 wrz', '7 wrz', '8 wrz', '9 wrz', '10 wrz', '11 wrz'],
    datasets: [
      {
        type: 'bar',
        label: 'Pracowniki plan',
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
