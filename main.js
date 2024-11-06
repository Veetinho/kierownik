


const ctx = document.getElementById('myChart')

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['5 wrz', '6 wrz', '7 wrz', '8 wrz', '9 wrz', '10 wrz', '11 wrz'],
    datasets: [
      {
        label: 'Plan',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Fakt',
        data: [55, 45, 77, 88, 60, 56, 42],
        fill: false,
        borderColor: 'green',
        tension: 0.1,
      },
      {
        type: 'bar',
        label: 'Zasoby plan',
        data: [5, 7, 7, 6, 4, 4, 5],
      },
      {
        type: 'bar',
        label: 'Zasoby fakt',
        data: [6, 6, 6, 6, 5, 4, 6],
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
