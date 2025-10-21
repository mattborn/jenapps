const formatDate = dateStr => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  const monthDay = `${date.toLocaleDateString('en-US', { month: 'short' })} ${day}`
  return year === 2025 ? monthDay : `${monthDay}, ${year}`
}

fetch('data/events.csv')
  .then(res => res.text())
  .then(csv => {
    const rows = csv.trim().split('\n').slice(1)
    const events = document.getElementById('events')
    const categories = new Set()
    let currentYear = null

    rows.forEach(row => {
      const [date, category, company, titles, links] = row.split(',')
      categories.add(category)

      const year = new Date(date).getFullYear()
      if (year !== currentYear) {
        currentYear = year
        events.insertAdjacentHTML('beforeend', `<div class="year-header">${year}</div>`)
      }

      const titleText = titles.replace(/;/g, ' aka ')
      const linkArray = links?.split(';') || []
      const hasPress = linkArray.length > 1

      const eventRow = document.createElement('div')
      eventRow.className = 'event-row'
      eventRow.dataset.category = category
      eventRow.innerHTML = `
        <div class="date">${formatDate(date)}</div>
        <div class="title">
          ${linkArray[0] ? `<a href="${linkArray[0]}" target="_blank">${titleText}</a>` : titleText}
          <span class="company">${company}</span>
        </div>
        ${hasPress ? `<a class="press" href="${linkArray[1]}" target="_blank">Press release</a>` : ''}
      `
      events.appendChild(eventRow)
    })

    const filterNav = document.getElementById('filter-nav')
    filterNav.insertAdjacentHTML('beforeend', '<a class="active" href="#all">All</a>')
    Array.from(categories)
      .sort()
      .forEach(cat => filterNav.insertAdjacentHTML('beforeend', `<a href="#${cat.toLowerCase()}">${cat}</a>`))
  })

document.addEventListener('click', e => {
  const filterLink = e.target.closest('#filter-nav a')
  if (!filterLink) return
  e.preventDefault()
  document.querySelectorAll('#filter-nav a').forEach(a => a.classList.remove('active'))
  filterLink.classList.add('active')
  const filter = filterLink.href.split('#')[1]
  document
    .querySelectorAll('#events .event-row')
    .forEach(
      row => (row.style.display = filter === 'all' || row.dataset.category.toLowerCase() === filter ? '' : 'none'),
    )
})
