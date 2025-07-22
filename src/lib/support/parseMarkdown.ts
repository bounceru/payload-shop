export function parseMarkdown(md: string): string {
  const lines = md.split(/\r?\n/)
  let html = ''
  let inList = false
  for (const line of lines) {
    if (/^###\s+(.*)/.test(line)) {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      html += `<h3>${RegExp.$1}</h3>`
    } else if (/^##\s+(.*)/.test(line)) {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      html += `<h2>${RegExp.$1}</h2>`
    } else if (/^#\s+(.*)/.test(line)) {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      html += `<h1>${RegExp.$1}</h1>`
    } else if (/^[-*]\s+(.*)/.test(line)) {
      if (!inList) {
        html += '<ul>'
        inList = true
      }
      html += `<li>${RegExp.$1}</li>`
    } else if (line.trim() === '') {
      if (inList) {
        html += '</ul>'
        inList = false
      }
    } else {
      if (inList) {
        html += '</ul>'
        inList = false
      }
      html += `<p>${line}</p>`
    }
  }
  if (inList) html += '</ul>'
  return html
}
