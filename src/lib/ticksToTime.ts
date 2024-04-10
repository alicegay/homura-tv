const ticksToTime = (ticks: number, formatted?: boolean) => {
  const seconds = ticks / 10000 / 1000

  const hh = Math.floor(seconds / 3600)
  const mm = Math.floor((seconds % 3600) / 60)
  const ss = Math.floor(seconds % 60)
  if (!formatted)
    return (hh > 0 ? hh + ':' : '') + pad(mm, 2) + ':' + pad(ss, 2)
  return (
    (hh > 0 ? hh + 'h ' : '') +
    (mm > 0 ? mm + 'm ' : '') +
    (hh === 0 && ss > 0 ? ss + 's' : '')
  )
}

const pad = (n: number, width: number) => {
  const nn = n.toString()
  return nn.length >= width
    ? nn
    : new Array(width - nn.length + 1).join('0') + nn
}

export const ticksToSecs = (ticks: number) => {
  return ticks / 10000 / 1000
}

export default ticksToTime
