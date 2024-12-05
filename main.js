const _ = (id) => document.getElementById(id)
const sidebar = _('sidebar')
const chartJobPlan = createJobPlanChart(
  _('chartJobPlan'),
  ['Plan'],
  'Plan wykonywania'
)
const chartJobPlanFact = createJobPlanChart(
  _('chartJobPlanFact'),
  ['Plan/Fakt'],
  'Plan/fakt wykonywania'
)
const chartEmployeesPlan = createEmployeesQuantityChart(
  _('chartEmployeesPlan'),
  ['Ilość'],
  'Pracowniki plan'
)
const chartEmployeesPlanFact = createEmployeesPlanFactChart(
  _('chartEmployeesPlanFact')
)

document.addEventListener('DOMContentLoaded', async () => {
  getInitialPlanningBlockHtml()
  setPlanDatesRange()
  // const {
  //   jobs,
  //   foremen,
  //   projects,
  //   factJobsDetail,
  //   planJobsDetail,
  //   planJobsGeneral,
  // } = await fetchData()
  // setToLocalStorage(
  //   ['jobs', jobs],
  //   ['foremen', foremen],
  //   ['projects', projects],
  //   ['factJobsDetail', factJobsDetail],
  //   ['planJobsDetail', planJobsDetail],
  //   ['planJobsGeneral', planJobsGeneral]
  // )
  setProjectDropdownOptions(JSON.parse(localStorage.getItem('projects')))
})

function setToLocalStorage(...items) {
  console.log('local')
  items.forEach((item) => {
    localStorage.setItem(item[0], JSON.stringify(item[1]))
  })
}

async function fetchData() {
  const data = await fetch(
    'https://script.google.com/a/macros/ispik.eu/s/AKfycbzJCQ-72SHrtq5rWk10ligJlfk7TFj3r4rRALmZK0VSUINcMDWE_bzwdizqkOIUGdm0/exec'
  )
  const json = await data.json()
  return json
}

function setNewPlanDataToSheet(data) {
  console.log(data)
  return true
}

sidebar.addEventListener('click', (e) => {
  const li = e.target.closest('li')
  if (li === null) return
  const activeDataSection = li.getAttribute('data-section')
  const elems = sidebar.querySelectorAll('li')
  elems.forEach((elem) => {
    elem.classList.remove('active')
    const dataSection = elem.getAttribute('data-section')
    _(dataSection).classList.add('hidden')
  })
  li.classList.add('active')
  _(activeDataSection).classList.remove('hidden')
})

_('detailPlanListForm').addEventListener('submit', (e) => {
  e.preventDefault()
  const detailPlanListFormData = getDetailPlanListFormData()
  const generalPlanInfoFormData = getGeneralPlanListFormData()
  const res = setNewPlanDataToSheet({
    detailPlanListFormData,
    generalPlanInfoFormData,
  })
  console.log(res)
})

_('planDateStart').addEventListener('change', (e) => {
  const value = e.target.value
  if (value === '' || value.startsWith(0)) return
  setPlanDateEnd(value)
  const datesDifference = getDaysDifference(value)
  setPlanEndDatesRange(datesDifference, datesDifference + 366)
  const daysBetween = getDatesRange()
  updatePlanQuantitySum()
  updatePlanDataAndCharts(daysBetween)
})

_('planDateEnd').addEventListener('change', (e) => {
  const value = e.target.value
  if (new Date(value).getTime() < new Date(_('planDateStart').value))
    setPlanDateEnd(_('planDateStart').value)
  if (value === '' || value.startsWith(0)) return
  const daysBetween = getDatesRange()
  updatePlanQuantitySum()
  updatePlanDataAndCharts(daysBetween)
})

_('planObject').addEventListener('input', () => {
  const project = _('planObject').value
  const jobs = JSON.parse(localStorage.getItem('planJobsGeneral'))
  const options = jobs
    .filter((v) => v.project === project)
    .map((v) => `<option value="${v.job}">${v.job}</option>`)
  options.unshift(
    '<option selected disabled value="">Wybierz rodzaj robót...</option>'
  )
  clearPlanObjectExtraInfo()
  updatePlanJobType(options.join(''))
  updatePlanJobDayQuantity()
  updatePlanQuantityTotal()
  updatePlanQuantitySum()
  onchangeDetailPlanListForm()
})

_('planJobType').addEventListener('input', () => {
  const project = _('planObject').value
  const job = _('planJobType').value
  const jobs = JSON.parse(localStorage.getItem('planJobsGeneral'))
  const projectJob = jobs.filter(
    (v) => v.job === job && v.project === project
  )[0]
  updatePlanObjectExtraInfo(projectJob)
  updatePlanJobDayQuantity()
  updatePlanQuantityTotal(projectJob?.quantity || 0)
  updatePlanQuantitySum()
  onchangeDetailPlanListForm()
})

function updatePlanObjectExtraInfo(projectJob) {
  const planObjectExtraInfo = _('planObjectExtraInfo')
  planObjectExtraInfo.innerHTML = getPlanObjectExtraInfoHtml(projectJob)
  planObjectExtraInfo.classList.remove('hidden')
}

function clearPlanObjectExtraInfo() {
  const planObjectExtraInfo = _('planObjectExtraInfo')
  planObjectExtraInfo.innerHTML = ''
  planObjectExtraInfo.classList.add('hidden')
}

function getDatesRange() {
  let ds = _('planDateStart').value
  let de = _('planDateEnd').value
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

function setPlanDateEnd(date) {
  _('planDateEnd').value = date
}

function updatePlanJobType(innerHtml, removeDisabled = true) {
  _('planJobType').innerHTML = innerHtml
  removeDisabled === true
    ? _('planJobType').removeAttribute('disabled')
    : _('planJobType').setAttribute('disabled', true)
}

function updatePlanQuantityTotal(value = 0) {
  _('planQuantityTotal').textContent = value
}

function updatePlanJobDayQuantity(value = 0) {
  _('planJobDayQuantity').value = value
}

function onchangeDetailPlanListForm() {
  const rows = _('detailPlanListForm').getElementsByClassName('w-full')
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
  updatePlanQuantitySum(data)
  updateEmployeesQuantityChart(
    data,
    data.map((v) => v.employees.reduce((a, b) => Number(a) + Number(b), 0))
  )
  updateJobPlanChart(
    data,
    data.map((v) => v.employees.reduce((a, b) => Number(a) + Number(b), 0))
  )
  const comparingResult = getComparePlanSumAndTotal()
  const color = getChartColor(comparingResult)
  updateEmployeesQuantityChartColor(color)
  updateJobPlanChartColor(color)

  const btn = _('submitFormBtn')

  if (_('planQuantitySum').textContent > 0 && comparingResult === 0)
    btn.classList.remove('hidden')
  else if (btn) btn.classList.add('hidden')
}

function updatePlanQuantitySum(data) {
  if (!data) return (_('planQuantitySum').textContent = 0)
  const coeff = parseFloat(_('planJobDayQuantity').value) || 0
  _('planQuantitySum').textContent = Math.round(
    data
      .map((v) => v.employees.reduce((a, b) => Number(a) + Number(b), 0))
      .reduce((a, b) => Number(a) + Number(b), 0) * coeff
  )
}

function setProjectDropdownOptions(projects) {
  const options = projects
    .sort((a, b) => {
      if (a.project < b.project) return -1
      if (a.project > b.project) return 1
      return 0
    })
    .map((v) => `<option value="${v.project}">${v.project}</option>`)
  options.unshift(
    '<option selected disabled value="">Wybierz obiekt...</option>'
  )
  _('planObject').innerHTML = options.join('')
  _('planFactObject').innerHTML = options.join('')
}

function setDaysQuantity(daysBetween) {
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
  _('planDateStart').setAttribute(
    'min',
    new Date(Date.now() + daysFromTodayForMin * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/T.+/g, '')
  )
  _('planDateStart').setAttribute(
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
  _('planDateEnd').setAttribute(
    'min',
    new Date(Date.now() + daysFromTodayForMin * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/T.+/g, '')
  )
  _('planDateEnd').setAttribute(
    'max',
    new Date(Date.now() + daysFromTodayForMax * 24 * 60 * 60 * 1000)
      .toISOString()
      .replace(/T.+/g, '')
  )
}

function resetHelpingCalcForm() {
  _('helpingCalcForm').reset()
  _('calcDrop2').setAttribute('disabled', true)
  _('calcInput2').setAttribute('disabled', true)
  _('calcResultValue').textContent = ''
  _('calcResultCategory').textContent = ''
}

function resetGeneralPlanInfoForm() {
  _('generalPlanInfoForm').reset()
  _('planDaysTotal').textContent = '0'
  _('planDaysWork').textContent = '0)'
  _('detailPlanListForm').innerHTML = ''
  _('planJobType').setAttribute('disabled', true)
  _('planQuantityTotal').textContent = 0
  onchangeDetailPlanListForm()
  clearPlanObjectExtraInfo()
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
      _('planQuantityTotal').textContent /
      calcInput1 /
      calcInput2
    ).toFixed(2)
  }
}

function floatInputPattern(e) {
  if (e.id === 'planJobDayQuantity') onchangeDetailPlanListForm()
  let value = e.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
  if (value == '.') value = '0.'
  e.value = value.startsWith('0') && !value.includes('.') ? value * 1 : value
}

function intInputPattern(e) {
  e.value = e.value.replace(/\D/g, '') * 1
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
  onchangeDetailPlanListForm()
}

function addOneMoreForemanBlock(e) {
  const inputsBlock = e.parentNode.querySelector('div')
  const newDiv = createNewForemanInputsBlock()
  const firstDiv = inputsBlock.querySelector('p')
  inputsBlock.insertBefore(newDiv, firstDiv)
}

function updateDatesRangeFormInnerHtml(dates) {
  _('detailPlanListForm').innerHTML =
    createDatesRangeFormInnerHtml(dates) + createSubmitFormButton()
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

function getChartColor(result) {
  if (result === 0) return 'rgb(96, 165, 250)'
  if (result > 0) return 'rgb(239, 68, 68)'
  return 'rgb(184, 197, 214)'
}

function getComparePlanSumAndTotal() {
  const sum = _('planQuantitySum').textContent
  const total = _('planQuantityTotal').textContent
  const min = Math.floor(total * 0.99)
  const max = Math.round(total * 1.01)
  return sum < min ? -1 : sum > max ? 1 : 0
}

function createJobPlanChart(ctx, labels, label) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: label,
          data: [1],
          fill: false,
          borderColor: 'rgb(96, 165, 250)',
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
  getArrayGrowthDataForChart(data)
  chartJobPlan.data.labels = labels.map((v) => {
    const regex = new RegExp(/\d{4}-\d{2}-\d{2}/, 'g')
    if (!regex.test(v.date)) return v.date
    return getDatePolishFormat(v.date)
  })
  chartJobPlan.data.datasets[0].data = data.map((v) => v * coeff)
  chartJobPlan.update()
}

function getArrayGrowthDataForChart(data) {
  return data.reduce((acc, el, i, arr) => {
    arr[i] = Number(acc) + Number(el)
    return arr[i]
  }, 0)
}

function updateJobPlanChartColor(color) {
  chartJobPlan.data.datasets[0].borderColor = color
  chartJobPlan.update()
}

function createEmployeesQuantityChart(ctx, labels, label) {
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: label,
          data: [0],
          borderRadius: 5,
          backgroundColor: 'rgb(96, 165, 250)',
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
    return getDatePolishFormat(v.date)
  })
  chartEmployeesPlan.data.datasets[0].data = data
  chartEmployeesPlan.update()
}

function updateEmployeesQuantityChartColor(color) {
  chartEmployeesPlan.data.datasets[0].backgroundColor = color
  chartEmployeesPlan.update()
}

function getDetailPlanListFormData() {
  const rows = _('detailPlanListForm').getElementsByClassName('w-full')
  const data = []
  let rowIndx = 0
  while (rowIndx < rows.length) {
    const dayData = {
      date: null,
      foremen: [],
      employees: [],
    }
    const row = rows[rowIndx]
    dayData.date = row.getElementsByTagName('p')[0].getAttribute('data-date')
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
  return data
}

function fillInDetailPlanListForm() {
  const rows = _('detailPlanListForm').getElementsByClassName('w-full')
  if (rows.length < 2) return
  const row = rows[0]
  const foreman = row.getElementsByTagName('select')[0].value
  const quantity = row.getElementsByTagName('input')[0].value
  if (foreman === '' || quantity === '') return
  for (let r = 1; r < rows.length; r++) {
    rows[r].getElementsByTagName('select')[0].value = foreman
    rows[r].getElementsByTagName('input')[0].value = quantity
  }
  onchangeDetailPlanListForm()
}

function getGeneralPlanListFormData() {
  const formData = new FormData(_('generalPlanInfoForm'))
  const dataAsObject = {}
  for (const pair of formData.entries()) dataAsObject[pair[0]] = pair[1]
  return dataAsObject
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

function getDatePolishFormat(date, isYear = false) {
  const newDate = new Date(date)
  return `${newDate.getDate()} ${getPolishMonthName(newDate.getMonth())}${
    isYear === true ? ` ${newDate.getFullYear()}` : ''
  }`
}

function createDatesRangeFormInnerHtml(dates) {
  const foremen = JSON.parse(localStorage.getItem('foremen'))
  const lastIndx = dates.length - 1
  return dates
    .map((v, i) => {
      const color = v.isWeekend ? '#cbd5e1' : '#e2e8f0'
      return `<div class="flex flex-row gap-2 w-full items-center justify-start p-1 border-${
        i === lastIndx ? 'y' : 't'
      } border-slate-300 ${v.isWeekend ? `bg-[${color}]` : ''}">
      <p class="w-16" data-date="${v.date}">${getDatePolishFormat(v.date)}</p>
      <div class="flex flex-col gap-1 items-center mr-auto">
        <div class="flex flex-row gap-2">
          <select class="bg-slate-200 py-1 px-2 rounded-md border border-blue-400" required>
            <option disabled selected value="">St. brygadzista</option>
            ${foremen.map((v) => `<option value="${v}">${v}</option>`).join('')}
          </select>
          <input
            class="py-1 px-2 rounded-md text-right w-12 bg-slate-200 border border-blue-400"
            type="text"
            maxlength="2"
            oninput="intInputPattern(this)"
            autocomplete="off"
            required
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
  const foremen = JSON.parse(localStorage.getItem('foremen'))
  const newDiv = document.createElement('div')
  newDiv.classList.add('flex', 'flex-row', 'gap-2')
  newDiv.innerHTML = `<select class="bg-slate-200 py-1 px-2 rounded-md border border-blue-400" required>
      <option disabled selected value="">St. brygadzista</option>
      ${foremen.map((v) => `<option value="${v}">${v}</option>`).join('')}
    </select>
    <input
      class="py-1 px-2 rounded-md text-right w-12 bg-slate-200 border border-blue-400"
      type="text"
      maxlength="2"
      oninput="intInputPattern(this)"
      autocomplete="off"
      required
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

function createSubmitFormButton() {
  return `<div class="flex flex-row min-w-full justify-end mb-2">
    <button
      type="submit"
      id="submitFormBtn"
      class="bg-blue-200 py-1 px-3 mt-2 rounded-xl border-2 border-blue-400 hidden"
    >Zatwierdź</button>
  </div>`
}

function getPlanObjectExtraInfoHtml(obj) {
  return `<h3 class="flex justify-center text-md font-semibold mb-2">Informacje dodatkowe</h3>
    <p class="text-sm">Nazwa projektu: ${obj.project}</p>
    <p class="text-sm mt-1">Dział: ${obj.department}</p>
    <p class="text-sm mt-1">Rodzaj robót: ${obj.job}</p>
    <p class="text-sm mt-1">Planowa data rozpoczęcia robót: ${getDatePolishFormat(
      obj.dateFrom,
      true
    )}</p>
    <p class="text-sm mt-1">Planowa data zakończenia robót: ${getDatePolishFormat(
      obj.dateTo,
      true
    )}`
}

/* ================================ PLAN / FACT ================================ */

function resetGeneralPlanFactInfoForm() {
  _('generalPlanFactInfoForm').reset()
  clearPlanFactObjectExtraInfo()
  updatePlanFactJobType(
    '<option selected disabled value="">Wybierz rodzaj robót...</option>',
    false
  )
  updateJobPlanFactChart()
  updateEmployeesPlanFactChart()
  updatePlanFactQuantityTotal()
}

_('planFactObject').addEventListener('input', () => {
  const project = _('planFactObject').value
  const jobs = JSON.parse(localStorage.getItem('factJobsDetail'))
  const plans = JSON.parse(localStorage.getItem('planJobsDetail'))
  const allJobs = jobs.filter((v) => v.project === project).map((v) => v.job)
  const allPlans = plans.filter((v) => v.project === project).map((v) => v.job)
  const uniqueJobs = Array.from(new Set([...allJobs, ...allPlans]))
  const options = uniqueJobs.map((v) => `<option value="${v}">${v}</option>`)
  options.unshift(
    '<option selected disabled value="">Wybierz rodzaj robót...</option>'
  )
  updatePlanFactJobType(options.join(''))
  updateJobPlanFactChart()
  updateEmployeesPlanFactChart()
  updatePlanFactQuantityTotal()
})

_('planFactJobType').addEventListener('input', () => {
  const project = _('planFactObject').value
  const job = _('planFactJobType').value
  const jobs = JSON.parse(localStorage.getItem('planJobsGeneral'))
  const projectJob = jobs.filter(
    (v) => v.job === job && v.project === project
  )[0]
  updatePlanFactObjectExtraInfo(projectJob)
  const factJobQuantity = getPlanFactDataToUpdateCharts()
  updatePlanFactQuantityTotal(
    projectJob?.quantity || 0,
    projectJob?.unit || null,
    factJobQuantity
  )
})

function updatePlanFactJobType(innerHtml, removeDisabled = true) {
  _('planFactJobType').innerHTML = innerHtml
  removeDisabled === true
    ? _('planFactJobType').removeAttribute('disabled')
    : _('planFactJobType').setAttribute('disabled', true)
}

function updatePlanFactQuantityTotal(total = 0, unit = null, fact = 0) {
  const numberFormat = new Intl.NumberFormat('pl-PL')
  const totalFormatted = numberFormat.format(total)
  const factFormatted = numberFormat.format(fact)
  const valueToDisplay =
    unit === null ? 0 : `${factFormatted} / ${totalFormatted} ${unit}`
  _('planFactQuantityTotal').textContent = valueToDisplay
}

function updatePlanFactObjectExtraInfo(projectJob) {
  const planFactObjectExtraInfo = _('planFactObjectExtraInfo')
  planFactObjectExtraInfo.innerHTML = getPlanObjectExtraInfoHtml(projectJob)
  planFactObjectExtraInfo.classList.remove('hidden')
}

function clearPlanFactObjectExtraInfo() {
  const planFactObjectExtraInfo = _('planFactObjectExtraInfo')
  planFactObjectExtraInfo.innerHTML = ''
  planFactObjectExtraInfo.classList.add('hidden')
}

function getPlanFactDataToUpdateCharts() {
  const project = _('planFactObject').value
  const jobType = _('planFactJobType').value
  const factJobsDetail = JSON.parse(localStorage.getItem('factJobsDetail'))
  const planJobsDetail = JSON.parse(localStorage.getItem('planJobsDetail'))

  const factJobsDetailFiltered = factJobsDetail.filter(
    (v) => v.project === project && v.job === jobType
  )
  const datesFact = getMinAndMaxDateValue(factJobsDetailFiltered, 'date')
  const factJobsDetailMap = new Map()
  const factEmployeesMap = new Map()
  factJobsDetailFiltered.forEach((v) => {
    factJobsDetailMap.set(getDatePolishFormat(v.date, true), v.quantity)
    factEmployeesMap.set(getDatePolishFormat(v.date, true), v.employees || 0)
  })

  const planJobsDetailFiltered = planJobsDetail.filter(
    (v) => v.project === project && v.job === jobType
  )
  const datesPlan = getMinAndMaxDateValue(planJobsDetailFiltered, 'date')
  const planJobsDetailMap = new Map()
  const planEmployeesMap = new Map()
  planJobsDetailFiltered.forEach((v) => {
    planJobsDetailMap.set(
      getDatePolishFormat(v.date, true),
      parseFloat(v.quantity * v.resources * 6)
    )
    planEmployeesMap.set(getDatePolishFormat(v.date, true), v.resources)
  })

  const arrayOfDates = getArrayOfDates(
    Math.min(...datesFact, ...datesPlan),
    Math.max(...datesFact, ...datesPlan)
  )

  const factJobQuantity = arrayOfDates
    .filter((v) => v < Date.now())
    .map((v) => factJobsDetailMap.get(getDatePolishFormat(v, true)) || 0)
  const factEmployeesQuantity = arrayOfDates
    .filter((v) => v < Date.now())
    .map((v) => factEmployeesMap.get(getDatePolishFormat(v, true)) || 0)

  const planJobQuantity = arrayOfDates.map(
    (v) => planJobsDetailMap.get(getDatePolishFormat(v, true)) || 0
  )
  const planEmployeesQuantity = arrayOfDates.map(
    (v) => planEmployeesMap.get(getDatePolishFormat(v, true)) || 0
  )

  let predictJobQuantity = null
  if (planJobQuantity.length - factJobQuantity.length > 2)
    predictJobQuantity = getPredictJobQuantity(planJobQuantity, factJobQuantity)

  updateJobPlanFactChart(
    arrayOfDates,
    planJobQuantity,
    factJobQuantity,
    predictJobQuantity
  )

  updateEmployeesPlanFactChart(
    arrayOfDates,
    planEmployeesQuantity,
    factEmployeesQuantity
  )

  return factJobQuantity[factJobQuantity.length - 1]
}

function getPredictJobQuantity(planJobQuantity, factJobQuantity) {
  const maxPlanValue = planJobQuantity.reduce((acc, v) => acc + v, 0)
  let maxFactValue = factJobQuantity.reduce((acc, v) => acc + v, 0)
  if (maxFactValue === 0) return null
  let firstWorkDayIndex = factJobQuantity.findIndex((v) => v > 0)
  if (firstWorkDayIndex > 0) firstWorkDayIndex--
  const lastWorkDayIndex = factJobQuantity.length - 1
  if (lastWorkDayIndex - firstWorkDayIndex < 4) return null
  const dailyEfficiency = parseFloat(
    maxFactValue / (lastWorkDayIndex - firstWorkDayIndex)
  )
  const predictArr = new Array(planJobQuantity.length).fill(NaN)
  for (let i = lastWorkDayIndex; i < predictArr.length; i++) {
    if (Math.round(maxFactValue) === Math.round(maxPlanValue)) break
    maxFactValue += dailyEfficiency
    if (maxFactValue > maxPlanValue) maxFactValue = maxPlanValue
    predictArr[i] = Math.round(maxFactValue)
  }
  return predictArr
}

function getMinAndMaxDateValue(arr, field) {
  if (arr.length === 0) return []
  const newArr = arr.map((v) => new Date(v[field]).getTime())
  return [Math.min(...newArr), Math.max(...newArr)]
}

function getArrayOfDates(dateFromAsTime, dateToAsTime) {
  const arr = []
  if (dateFromAsTime > dateToAsTime) return arr
  while (dateToAsTime >= dateFromAsTime) {
    arr.push(dateFromAsTime)
    dateFromAsTime += 86400000
  }
  let i = 0
  while (i < 7) {
    arr.push(dateFromAsTime)
    dateFromAsTime += 86400000
    i++
  }
  return arr
}

function createEmployeesPlanFactChart(ctx) {
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Plan',
          data: [],
          backgroundColor: '#94a3b8',
          borderColor: '#94a3b8',
          borderWidth: 1,
        },
        {
          label: 'Fakt',
          data: [],
          backgroundColor: 'rgb(96, 165, 250, 0.5)',
          borderColor: 'rgb(96, 165, 250)',
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      // scales: {
      //   x: {
      //     stacked: true,
      //   },
      //   y: {
      //     beginAtZero: true,
      //     stacked: true,
      //   },
      // },
    },
  })
}

function updateEmployeesPlanFactChart(
  labels = [new Date()],
  planData = [],
  factData = []
) {
  chartEmployeesPlanFact.data.labels = labels.map((v) => getDatePolishFormat(v))
  chartEmployeesPlanFact.data.datasets[0].data = planData
  chartEmployeesPlanFact.data.datasets[1].data = factData
  chartEmployeesPlanFact.update()
}

function updateJobPlanFactChart(
  labels = [new Date()],
  dataPlan = [],
  dataFact = [],
  dataPredict = null
) {
  getArrayGrowthDataForChart(dataPlan)
  getArrayGrowthDataForChart(dataFact)
  chartJobPlanFact.data.labels = labels.map((v) => getDatePolishFormat(v))
  chartJobPlanFact.data.datasets = [
    {
      label: 'Fakt',
      data: dataFact,
      fill: false,
      borderColor: 'rgb(96, 165, 250)',
      pointStyle: false,
      tension: 0.9,
      cubicInterpolationMode: 'monotone',
    },
    {
      label: 'Plan',
      data: dataPlan.map((v) => Math.round(v)),
      borderColor: '#94a3b8',
      backgroundColor: 'rgb(203, 213, 225, 0.5)',
      fill: true,
      pointStyle: false,
      tension: 0.9,
      cubicInterpolationMode: 'monotone',
    },
  ]
  if (dataPredict !== null) {
    chartJobPlanFact.data.datasets.splice(1, 0, {
      label: 'Prognoza',
      data: dataPredict,
      fill: false,
      borderColor: 'rgb(96, 165, 250)',
      borderDash: [5, 5],
      pointStyle: false,
      tension: 0.9,
    })
  }
  chartJobPlanFact.update()
}

/* ================================ INITIAL PLANNING ================================ */

function getInitialPlanningBlockHtml() {
  const projectsInfo = JSON.parse(localStorage.getItem('projects'))
  if (projectsInfo === null) return setInitialPlanningInnerHtml()
  projectsInfo.sort(
    (a, b) => new Date(b.dateFrom).getTime() - new Date(a.dateFrom).getTime()
  )

  // const projects = projectsInfo?.map((v) => v.project)
  // if (projects.some((v) => v === undefined))
  //   return setInitialPlanningInnerHtml()

  // const jobs = JSON.parse(localStorage.getItem('planJobsGeneral'))?.filter(
  //   (v) => projects.includes(v.project)
  // )
  // if (jobs === undefined || jobs.length === 0)
  //   return setInitialPlanningInnerHtml()

  // const jobsGrupped = Object.groupBy(jobs, ({ project }) => project)
  // if (jobsGrupped['undefined']) return setInitialPlanningInnerHtml()

  // const jobTypes = JSON.parse(localStorage.getItem('jobs'))
  // if (jobTypes === null) return setInitialPlanningInnerHtml()

  let html = ''
  for (const prjct of projectsInfo) {
    html += `<div class="border border-blue-400 rounded-xl">
      <div class="flex flex-row items-center w-full p-4 rounded-md focus:outline-none">
        <div class="w-3/12 text-left">${prjct.project}</div>
        <div class="w-3/12 text-left">${prjct.contractor}</div>
        <div class="w-2/12 flex justify-end">${getDatePolishFormat(
          prjct.dateFrom,
          true
        )}</div>
        <div class="w-2/12 flex justify-end">${getDatePolishFormat(
          prjct.dateTo,
          true
        )}</div>
        <div class="w-2/12 flex justify-end">
          <button
            class="flex flex-row gap-3 items-center bg-transparent text-gray-900 py-2 px-4 rounded-md border border-blue-400"
            data-project="${prjct.project}"
            onclick="showDetailPlanningForm(this)"
          >
            <p>Edytuj</p>
            <svg
              class="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              fill="currentColor"
            >
              <path
                d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v200h-80v-40H200v400h280v80H200Zm0-560h560v-80H200v80Zm0 0v-80 80ZM560-80v-123l221-220q9-9 20-13t22-4q12 0 23 4.5t20 13.5l37 37q8 9 12.5 20t4.5 22q0 11-4 22.5T903-300L683-80H560Zm300-263-37-37 37 37ZM620-140h38l121-122-18-19-19-18-122 121v38Zm141-141-19-18 37 37-18-19Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>`
  }
  setInitialPlanningInnerHtml(html)
}

function showDetailPlanningForm(e) {
  const project = e.getAttribute('data-project')
  const jobs = JSON.parse(localStorage.getItem('planJobsGeneral'))?.filter(
    (v) => v.project === project
  )
  const jobTypes = JSON.parse(localStorage.getItem('jobs'))
  if (jobTypes === null) return setInitialPlanningInnerHtml()

  const formHtml = getInitialPlanningInputsRowHtml(jobTypes, jobs)
  const aboveFormHtml = getInitialPlanningFormHeaderHtml(project)
  setInitialPlanningDetailInnerHtml(aboveFormHtml + formHtml)
}

function getInitialPlanningInputsRowHtml(jobTypes, jobs) {
  const html = jobTypes.map((v) => {
    const elem = getArrayElementByField(jobs, 'job', v.job)
    return `<div class="flex flex-row justify-start items-center py-1 px-1">
      <input type="hidden" name="id" value="${elem?.id || ''}" />
      <input type="text" name="job" class="bg-transparent w-4/12 mx-1 italic" value="${
        v.job
      }" readonly disabled />
      <input type="text" name="department" value="${
        v.department
      }" class="bg-transparent w-2/12 mx-1 italic" readonly disabled />
      <input type="text" name="quantity" value="${
        elem?.quantity || ''
      }" class="bg-slate-100 border border-blue-200 rounded-md w-1/12 mx-1 p-1 text-right" oninput="intInputPattern(this)" maxlength="6" />
      <input type="text" name="unit" value="${
        v.unit
      }" class="bg-transparent w-1/12 mx-1 italic" readonly disabled />
      <input type="date" name="dateFrom" class="bg-slate-100 border border-blue-200 rounded-md w-2/12 text-center mx-1 py-1"
      value="${elem?.dateFrom || ''}"/>
      <input type="date" name="dateTo" class="bg-slate-100 border border-blue-200 rounded-md w-2/12 text-center mx-1 py-1"
      value="${elem?.dateTo || ''}"/>
    </div>`
  })
  html.push(
    `<div class="w-full flex justify-end">
      <button
        class="flex flex-row gap-3 items-center bg-transparent text-gray-700 m-2 py-2 px-4 rounded-md border border-blue-400 transition ease-in-out delay-150 hover:bg-blue-100 hover:-translate-1 hover:scale-110 duration-200"
        onclick="showDetailPlanningForm(this)"
      >
        <p>Zapisz</p>
        <svg
          class="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="currentColor"
        >
          <path
            d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"
          />
        </svg>
      </button>
    </div>`
  )
  return `<form class="border border-dashed border-blue-300 rounded-lg p-2">${html.join(
    ''
  )}</form>`
}

function getInitialPlanningFormHeaderHtml(project) {
  const projects = JSON.parse(localStorage.getItem('projects'))
  if (projects === null) return ''
  const prjct = projects.find((v) => v.project == project)

  return `<div class="border border-blue-400 rounded-xl mb-3">
    <div class="flex flex-row items-center w-full p-4 rounded-md focus:outline-none">
      <div class="w-3/12 text-left">${prjct.project}</div>
      <div class="w-3/12 text-left">${prjct.contractor}</div>
      <div class="w-2/12 flex justify-end">
        ${getDatePolishFormat(prjct.dateFrom, true)}
      </div>
      <div class="w-2/12 flex justify-end">
        ${getDatePolishFormat(prjct.dateTo, true)}
      </div>
      <div class="w-2/12 flex justify-end">
        <button
          class="flex bg-transparent text-gray-900 p-2 rounded-md border border-blue-400"
          onclick="hideDetailPlanningForm()"
        >
          <svg
            class="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            fill="currentColor"
          >
            <path
              d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>`
}

function getArrayElementByField(arr, field, value) {
  if (arr === undefined) return null
  const needed = arr.filter((v) => v[field] === value)
  return needed.length === 0 ? null : needed[0]
}

function setInitialPlanningInnerHtml(
  html = '<p class="p-3">Problem z pobieraniem danych...</p>'
) {
  _('initialPlanningGeneral').innerHTML = html
}

function setInitialPlanningDetailInnerHtml(html) {
  const initialPlanningDetail = document.getElementById('initialPlanningDetail')
  initialPlanningDetail.innerHTML = html
  _('initialPlanningGeneral').classList.add('hidden')
  initialPlanningDetail.classList.remove('hidden')
}

function hideDetailPlanningForm() {
  const initialPlanningDetail = document.getElementById('initialPlanningDetail')
  initialPlanningDetail.innerHTML = ''
  _('initialPlanningGeneral').classList.remove('hidden')
  initialPlanningDetail.classList.add('hidden')
}
