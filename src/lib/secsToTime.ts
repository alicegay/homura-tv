const secsToTime = (seconds: number) => {
  const hh = Math.floor(seconds / 3600)
  const mm = Math.floor((seconds % 3600) / 60)
  const ss = Math.floor(seconds % 60)
  return (hh > 0 ? hh + ':' : '') + pad(mm, 2) + ':' + pad(ss, 2)
}

const pad = (n: number, width: number) => {
  const nn = n.toString()
  return nn.length >= width
    ? nn
    : new Array(width - nn.length + 1).join('0') + nn
}

export default secsToTime
