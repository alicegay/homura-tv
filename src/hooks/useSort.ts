import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from 'lib/storage'

export enum By {
  SortName = 'IsFolder,SortName',
  Name = 'IsFolder,Name',
  ReleaseDate = 'ProductionYear,PremiereDate,SortName',
  DateAdded = 'DateCreated,SortName',
  Runtime = 'Runtime,SortName',
}

export enum Order {
  Asc = 'Ascending',
  Desc = 'Descending',
}

export const sortNames: { [name: string]: string } = {
  [By.SortName]: 'Name',
  [By.Name]: 'Unsorted Name',
  [By.ReleaseDate]: 'Release Date',
  [By.DateAdded]: 'Date Added',
  [By.Runtime]: 'Runtime',
}

type Sort = [By, Order]
export const defaultSort: Sort = [By.SortName, Order.Asc]

interface SortStore {
  ids: { [id: string]: Sort }

  set: (id: string, by: By, order: Order) => void
  get: (id: string) => Sort
}

const useSort = create<SortStore>()(
  persist(
    (set, get) => ({
      ids: {},

      set: (id, by, order) =>
        set((state) => ({ ids: { ...state.ids, [id]: [by, order] } })),
      get: (id) => {
        if (id in get().ids) {
          return get().ids[id]
        } else {
          return defaultSort
        }
      },
    }),
    {
      name: 'settings',
      storage: createJSONStorage(() => storage),
    },
  ),
)

export default useSort
