const getCurrentTimestamp = () => {
  const now = new Date()
  const isoString = now.toISOString() // ISO 8601 format without the timezone offset

  // Append the timezone offset
  const timestampWithOffset = `${isoString.substring(0, 23)}+00:00`

  return timestampWithOffset
}

export default getCurrentTimestamp
