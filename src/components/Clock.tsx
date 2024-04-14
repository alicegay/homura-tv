import { useEffect, useState } from 'react'
import Text from './Text'
import useInterval from 'hooks/useInterval'

const Clock = (props) => {
  const [realTime, setRealTime] = useState('')

  useEffect(() => {
    getRealTime()
  }, [])
  useInterval(() => {
    getRealTime()
  }, 1000)

  const getRealTime = () => {
    const date = new Date()
    const time =
      ('0' + date.getHours()).slice(-2) +
      ':' +
      ('0' + date.getMinutes()).slice(-2)
    if (realTime !== time) setRealTime(time)
  }

  return <Text {...props}>{realTime}</Text>
}

export default Clock
