const _ = (id) => document.getElementById(id)
const detailPlanListForm = _('detailPlanListForm')
const chartJobPlan = createJobPlanChart(_('chartJobPlan'))
const chartEmployeesPlan = createEmployeesQuantityChart(_('chartEmployeesPlan'))
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
  const daysBetween = getDatesRange()
  updatePlanDataAndCharts(daysBetween)
})

planDateEnd.addEventListener('change', (e) => {
  const value = e.target.value
  if (new Date(value).getTime() < new Date(planDateStart.value))
    planDateEnd.value = planDateStart.value
  if (value === '' || value.startsWith(0)) return
  const daysBetween = getDatesRange()
  updatePlanDataAndCharts(daysBetween)
})

detailPlanListForm.addEventListener('change', (e) => {
  e.preventDefault()
  const rows = detailPlanListForm.getElementsByClassName('w-full')
  const data = []
  let rowIndx = 0
  while (rowIndx < rows.length) {
    const dayData = {
      date: null,
      foremen: [],
      employees: [],
    }
    const row = rows[rowIndx]
    dayData.date = row.getElementsByTagName('p')[0].textContent
    const foremen = row.getElementsByTagName('select')
    let foremenIndx = 0
    while (foremenIndx < foremen.length) {
      dayData.foremen.push(foremen[foremenIndx].value)
      foremenIndx++
    }
    const employees = row.getElementsByTagName('input')
    let employeeIndx = 0
    while (employeeIndx < employees.length) {
      dayData.employees.push(employees[employeeIndx].value)
      employeeIndx++
    }
    data.push(dayData)
    rowIndx++
  }
  updateEmployeesQuantityChart(
    data,
    data.map((v) => v.employees.reduce((a, b) => Number(a) + Number(b), 0))
  )
  updateJobPlanChart(
    data,
    data.map((v) => v.employees.reduce((a, b) => Number(a) + Number(b), 0))
  )
})

function setDaysQuantity(daysBetween) {
  _('planDaysTotal').textContent = daysBetween.allDays.toString()
  _('planDaysWork').textContent = `${daysBetween.workDays.toString()})`
}

function getDatesRange() {
  let ds = planDateStart.value
  let de = planDateEnd.value
  if (ds === '' || de === '' || de.startsWith(0) || ds.startsWith(0)) return
  const daysBetween = {
    dates: [],
    allDays: 0,
    workDays: 0,
  }
  while (ds !== de) {
    daysBetween.dates.push({
      date: ds,
      isWeekend: new Date(ds).getDay() === 0,
    })
    daysBetween.allDays++
    if (new Date(ds).getDay() !== 0) daysBetween.workDays++
    ds = new Date(new Date(ds).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/T.+/g, '')
  }
  daysBetween.allDays++
  daysBetween.dates.push({
    date: ds,
    isWeekend: new Date(ds).getDay() === 0,
  })
  if (new Date(ds).getDay() !== 0) daysBetween.workDays++
  return daysBetween
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

function removeForemanInputsBlock(e) {
  e.parentNode.remove()
}

function addOneMoreForemanBlock(e) {
  const inputsBlock = e.parentNode.querySelector('div')
  const newDiv = createNewForemanInputsBlock()
  const firstDiv = inputsBlock.querySelector('p')
  inputsBlock.insertBefore(newDiv, firstDiv)
}

function updateDatesRangeFormInnerHtml(dates) {
  detailPlanListForm.innerHTML = createDatesRangeFormInnerHtml(dates)
}

function updatePlanDataAndCharts(
  daysBetween,
  dataJob = null,
  dataEmployees = null
) {
  setDaysQuantity(daysBetween)
  updateDatesRangeFormInnerHtml(daysBetween.dates)
  updateJobPlanChart(
    daysBetween.dates,
    dataJob || new Array(daysBetween.dates.length).fill(0)
  )
  updateEmployeesQuantityChart(
    daysBetween.dates,
    dataEmployees || new Array(daysBetween.dates.length).fill(0)
  )
}

function createJobPlanChart(ctx) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Plan'],
      datasets: [
        {
          label: 'Plan wykonywania',
          data: [1],
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    },
    options: {
      spanGaps: true,
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
}

function updateJobPlanChart(labels, data) {
  const coeff = parseFloat(_('planJobDayQuantity').value) || 0
  data.reduce((acc, el, i, arr) => {
    arr[i] = Number(acc) + Number(el)
    return arr[i]
  }, 0)
  chartJobPlan.data.labels = labels.map((v) => {
    const regex = new RegExp(/\d{4}-\d{2}-\d{2}/, 'g')
    if (!regex.test(v.date)) return v.date
    const date = new Date(v.date)
    return `${date.getDate()} ${getPolishMonthName(date.getMonth())}`
  })
  chartJobPlan.data.datasets[0].data = data.map((v) => v * coeff)
  chartJobPlan.update()
}

function createEmployeesQuantityChart(ctx) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Ilość'],
      datasets: [
        {
          type: 'bar',
          label: 'Pracowniki plan',
          data: [0],
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
}

function updateEmployeesQuantityChart(labels, data) {
  chartEmployeesPlan.data.labels = labels.map((v) => {
    const regex = new RegExp(/\d{4}-\d{2}-\d{2}/, 'g')
    if (!regex.test(v.date)) return v.date
    const date = new Date(v.date)
    return `${date.getDate()} ${getPolishMonthName(date.getMonth())}`
  })
  chartEmployeesPlan.data.datasets[0].data = data
  chartEmployeesPlan.update()
}

function getPolishMonthName(num) {
  return [
    'sty',
    'lut',
    'mar',
    'kwi',
    'maj',
    'cze',
    'lip',
    'sie',
    'wrz',
    'paź',
    'lis',
    'gru',
  ][num]
}

function createDatesRangeFormInnerHtml(dates) {
  return dates
    .map((v) => {
      const color = v.isWeekend ? '#e2e8f0' : '#f8fafc'
      const date = new Date(v.date)
      return `<div class="flex flex-row gap-2 w-full items-center justify-start p-1 border-t-2 border-blue-100 ${
        v.isWeekend ? `bg-[${color}]` : ''
      }">
      <p class="w-16">${date.getDate()} ${getPolishMonthName(
        date.getMonth()
      )}</p>
      <div class="flex flex-col gap-1 items-center mr-auto">
        <div class="flex flex-row gap-2">
          <select class="bg-slate-100 py-1 px-2 rounded-md">
            <option disabled selected value="">St. brygadzista</option>
            <option value="Chuprin">Chuprin</option>
            <option value="Ivantsov">Ivantsov</option>
            <option value="Kruk">Kruk</option>
          </select>
          <input
            class="py-1 px-2 rounded-md text-right w-12 bg-slate-100"
            type="text"
            maxlength="2"
            oninput="intInputPattern(this)"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="30px"
            width="30px"
            viewBox="0 -960 960 960"
            fill="${color}"
          >
            <path
              d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"
            />
          </svg>
        </div>
      </div>
      <div onclick="addOneMoreForemanBlock(this)">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="36px"
          width="36px"
          viewBox="0 -960 960 960"
          class="fill-blue-400 cursor-pointer"
        >
          <path
            d="M440-280h80v-160h160v-80H520v-160h-80v160H280v80h160v160Zm40 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
          />
        </svg>
      </div>
    </div>`
    })
    .join('')
}

function createNewForemanInputsBlock() {
  const newDiv = document.createElement('div')
  newDiv.classList.add('flex', 'flex-row', 'gap-2')
  newDiv.innerHTML = `<select class="bg-slate-100 py-1 px-2 rounded-md">
      <option disabled selected value="">St. brygadzista</option>
      <option value="Chuprin">Chuprin</option>
      <option value="Ivantsov">Ivantsov</option>
      <option value="Kruk">Kruk</option>
    </select>
    <input
      class="py-1 px-2 rounded-md text-right w-12 bg-slate-100"
      type="text"
      maxlength="2"
      oninput="intInputPattern(this)"
    />
    <svg
      class="cursor-pointer"
      onclick="removeForemanInputsBlock(this)"
      xmlns="http://www.w3.org/2000/svg"
      height="30px"
      width="30px"
      viewBox="0 -960 960 960"
      fill="#d14759"
    >
      <path
        d="m376-300 104-104 104 104 56-56-104-104 104-104-56-56-104 104-104-104-56 56 104 104-104 104 56 56Zm-96 180q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520Zm-400 0v520-520Z"
      />
    </svg>`
  return newDiv
}
