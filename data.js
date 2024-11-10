const planJobsGeneral = [
  {
    id: 'fhfgsdfg',
    timestamp: '2024-08-08 12:56',
    project: 'Batkowo',
    job: 'Kafarowanie słupów konstrukcji',
    quantity: '5149',
    entity: 'szt',
    dateFrom: '2024-08-06',
    dateTo: '2024-09-26',
  },
  {
    id: 'fhfgsdfg',
    timestamp: '2024-08-08 12:56',
    project: 'Batkowo',
    job: 'Kafarowanie słupów ogrodzenia',
    quantity: '100',
    entity: '%',
    dateFrom: '2024-08-06',
    dateTo: '2024-09-26',
  },
  {
    id: 'fhfgsdfg',
    timestamp: '2024-08-08 12:56',
    project: 'Batkowo',
    job: 'Ułożenia kabli DC',
    quantity: '1180',
    entity: 'szt',
    dateFrom: '2024-08-06',
    dateTo: '2024-09-26',
  },
  {
    id: 'fhfgsdfg',
    timestamp: '2024-08-08 12:56',
    project: 'Batkowo',
    job: 'Montaż ogrodzenia',
    quantity: '100',
    entity: '%',
    dateFrom: '2024-08-06',
    dateTo: '2024-09-26',
  },
  {
    id: 'fhfgsdfg',
    timestamp: '2024-08-08 12:56',
    project: 'Batkowo',
    job: 'Montaż PV modułów',
    quantity: '29473',
    entity: 'szt',
    dateFrom: '2024-08-06',
    dateTo: '2024-09-26',
  },
  {
    id: 'fhfgsdfg',
    timestamp: '2024-08-08 12:56',
    project: 'Batkowo',
    job: 'Montaż stołów',
    quantity: '433',
    entity: 'szt',
    dateFrom: '2024-08-06',
    dateTo: '2024-09-26',
  },
]

/*
id	
kontrahent	
obiekt	
lokalizacja	
data rozpoczęcia	
data zakończenia	
typ farmy	
pinezka	
kierownik	
ilość MW	
dokumentacja
*/

const projects = [
  'Dobiegniew 40',
  'Bogdaniec 81',
  'Słubice 60',
  'Słubice 80',
  'Słubice 62a',
  'Serniki',
  'Nowy Tomyśl 9',
  'Lubiszyn 80',
  'Batkowo',
  'Janikowo',
  'Skałowo A&C',
  'Wróblewo A&B',
  'Wieluń Wschód Południe',
  'Stelpe',
  'Karsin',
  'Gogolin',
  'Szczawin',
]

const planJobsDetail = [
  {
    id: 'gfsdfgd',
    timestamp: '2024-11-08 12:56',
    version: 'active',
    manager: 'Seniuk',
    project: 'Batkowo',
    foreman: 'Ivan Varanets',
    date: '2024-11-20',
    job: 'Montaż PV modułów',
    efficiency: '25',
    quantity: '20',
  },
  {
    id: 'gfsdfgd',
    timestamp: '2024-11-08 12:56',
    version: 'active',
    manager: 'Seniuk',
    project: 'Batkowo',
    foreman: 'Ivan Varanets',
    date: '2024-11-21',
    job: 'Montaż PV modułów',
    efficiency: '25',
    quantity: '20',
  },
  {
    id: 'gfsdfgd',
    timestamp: '2024-11-08 12:56',
    version: 'active',
    manager: 'Seniuk',
    project: 'Batkowo',
    foreman: 'Ivan Varanets',
    date: '2024-11-22',
    job: 'Montaż PV modułów',
    efficiency: '25',
    quantity: '20',
  },
  {
    id: 'gfsdfgd',
    timestamp: '2024-11-08 12:56',
    version: 'active',
    manager: 'Seniuk',
    project: 'Batkowo',
    foreman: 'Ivan Varanets',
    date: '2024-11-23',
    job: 'Montaż PV modułów',
    efficiency: '25',
    quantity: '20',
  },
]

const jobTypes = [
  'Kafarowanie słupów konstrukcji',
  'Kafarowanie słupów ogrodzenia',
  'Montaż ogrodzenia',
  'Montaż stołów',
  'Montaż PV modułów',
  'Ułożenia kabli AC',
  'Ułożenia kabli DC',
  'Podłączenia inwerterów AC',
  'Podłączenia inwerterów DC',
  'Trafostacja posadowienie',
  'Trafostacja podłączenie',
  'Montaż & podłączenia CCTV',
  'Estetyka etc.',
]

export default data = {
  jobTypes,
  planJobsDetail,
  planJobsGeneral,
  projects,
}
