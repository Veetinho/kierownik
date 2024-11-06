const ctx = document.getElementById('myChart')

new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange', 'Another'],
    datasets: [
      {
        label: 'My First Dataset',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'My First Dataset',
        data: [55, 45, 77, 88, 60, 56, 42],
        fill: false,
        borderColor: 'green',
        tension: 0.1,
      },
      {
        type: 'bar',
        label: 'Bar Dataset',
        data: [5, 7, 7, 6, 4, 4],
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
