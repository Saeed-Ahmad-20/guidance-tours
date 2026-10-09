// Title Case for headings: "Etiquette of the visit" -> "Etiquette of the Visit".
// Short joining words stay lowercase (unless first, last, or after a colon or
// dash). Words that already contain a capital (names, "Ka’bah", "MS782") and
// Arabic-article names such as "al-Haram" are left as written.

const MINOR = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'the', 'to', 'up', 'via'])
const ARABIC_ARTICLE = /^(al|an|ar|as|at|ad|adh|ash|az|ath|aw)-/i

const upperFirst = (s: string) => s.replace(/[A-Za-z]/, c => c.toUpperCase())

function styleWord(core: string, keepLower: boolean): string {
  if (ARABIC_ARTICLE.test(core)) return core
  if (!core.includes('-')) {
    if (/[A-Z]/.test(core)) return core // already styled
    return keepLower && MINOR.has(core.toLowerCase()) ? core.toLowerCase() : upperFirst(core)
  }
  // Hyphenated compounds: capitalise every part ("High-Speed", "Day-by-Day").
  const parts = core.split('-')
  return parts
    .map((part, i) => {
      if (/[A-Z]/.test(part)) return part
      const middle = i > 0 && i < parts.length - 1
      return middle && MINOR.has(part.toLowerCase()) ? part.toLowerCase() : upperFirst(part)
    })
    .join('-')
}

export function titleCase(input: string): string {
  const tokens = input.split(' ')
  const last = tokens.length - 1
  return tokens
    .map((token, i) => {
      const m = token.match(/^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9’']*)$/)
      if (!m || !/[A-Za-z]/.test(m[2])) return token
      const [, pre, core, post] = m
      const prev = i > 0 ? tokens[i - 1] : ''
      const startsClause = i === 0 || /[:—–]$/.test(prev) || /^[—–]$/.test(prev)
      const keepLower = !startsClause && i !== last
      return pre + styleWord(core, keepLower) + post
    })
    .join(' ')
}
