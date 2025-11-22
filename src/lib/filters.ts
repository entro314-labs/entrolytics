export const urlFilter = (data: any[]) => {
  if (!Array.isArray(data)) return []
  const map = data.reduce((obj, { x, y }) => {
    if (x) {
      if (!obj[x]) {
        obj[x] = y
      } else {
        obj[x] += y
      }
    }

    return obj
  }, {})

  return Object.keys(map).map((key) => ({ x: key, y: map[key] }))
}

export const refFilter = (data: any[]) => {
  if (!Array.isArray(data)) return []
  const links = {}

  const map = data.reduce((obj, { x, y }) => {
    let id

    try {
      const url = new URL(x)

      id = url.hostname.replace(/www\./, '') || url.href
    } catch {
      id = ''
    }

    links[id] = x

    if (!obj[id]) {
      obj[id] = y
    } else {
      obj[id] += y
    }

    return obj
  }, {})

  return Object.keys(map).map((key) => ({
    x: key,
    y: map[key],
    w: links[key],
  }))
}

export const emptyFilter = (data: any[]) => {
  if (!Array.isArray(data)) return []
  return data.map((item) => (item.x ? item : null)).filter((n) => n)
}

export const percentFilter = (data: any[]) => {
  if (!data || !Array.isArray(data)) return []
  const total = data.reduce((n, item) => {
    const y = typeof item?.y === 'number' ? item.y : 0
    return n + y
  }, 0)
  return data.map((item, index) => {
    const { x, y, ...props } = item || {}
    const safeY = typeof y === 'number' ? y : 0
    return {
      x: x != null ? x : `item-${index}`,
      y: safeY,
      z: total > 0 ? (safeY / total) * 100 : 0,
      ...props,
    }
  })
}

export const paramFilter = (data: any[]) => {
  if (!Array.isArray(data)) return []
  const map = data.reduce((obj, { x, y }) => {
    try {
      const searchParams = new URLSearchParams(x)

      for (const [key, value] of searchParams) {
        if (!obj[key]) {
          obj[key] = { [value]: y }
        } else if (!obj[key][value]) {
          obj[key][value] = y
        } else {
          obj[key][value] += y
        }
      }
    } catch {
      // Ignore
    }

    return obj
  }, {})

  return Object.keys(map).flatMap((key) =>
    Object.keys(map[key]).map((n) => ({
      x: `${key}=${n}`,
      p: key,
      v: n,
      y: map[key][n],
    }))
  )
}
