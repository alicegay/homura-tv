import Item from 'jellyfin-api/lib/types/media/Item'

const cardSubtitle = (item: Item) => {
  if (item.Type === 'Episode') {
    if (item.ParentIndexNumber === 0) {
      return 'Special - ' + item.Name
    }
    return (
      'S' +
      item.ParentIndexNumber +
      ':' +
      'E' +
      item.IndexNumber +
      ' ' +
      item.Name
    )
  }
  if (!!item.ProductionYear) {
    return item.ProductionYear.toString()
  }
  return undefined
}

export default cardSubtitle
