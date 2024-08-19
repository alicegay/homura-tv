const secsToTicks = (seconds: number) => {
  //const seconds = ticks / 10000 / 1000
  return Math.round(seconds * 1000 * 10000)
}

export default secsToTicks
