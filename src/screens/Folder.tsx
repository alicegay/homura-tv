import { useEffect, useRef, useState } from 'react'
import {
  FlatList,
  Modal,
  ScrollView,
  View,
  findNodeHandle,
  useWindowDimensions,
} from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import useSort, { By, defaultSort, Order, sortNames } from 'hooks/useSort'
import useUserItems from 'api/useUserItems'
import ItemCard from 'components/ItemCard'
import Text from 'components/Text'
import findAspectRatio from 'lib/findAspectRatio'
import Item from 'jellyfin-api/lib/types/media/Item'
import ticksToTime from 'lib/ticksToTime'
import CenterLoading from 'components/CenterLoading'
import { useQueryClient } from '@tanstack/react-query'
import Button from 'components/Button'
import ListButton from 'components/ListButton'
import BlurView from '@sbaiahmed1/react-native-blur'

const Folder = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Folder'>) => {
  const client = useClient()
  const theme = useTheme()
  const query = useQueryClient()
  const { width } = useWindowDimensions()
  const sort = useSort()

  const { item, ignoreLengths } = route.params
  const sortBy = item.Id in sort.ids ? sort.ids[item.Id][0] : defaultSort[0]
  const sortOrder = item.Id in sort.ids ? sort.ids[item.Id][1] : defaultSort[1]
  const { data, isLoading, isRefetching } = useUserItems(item.Id, {
    SortBy: sortBy,
    SortOrder: sortOrder,
    Fields: 'OriginalTitle',
    EnableImageTypes: 'Primary,Backdrop,Logo',
    Recursive: false,
    IncludeItemTypes: 'Folder,Movie,Series,MusicVideo',
  })

  const [showSortMenu, setShowSortMenu] = useState(false)
  const sortButtonRef = useRef(null)
  const sortButtonNode = findNodeHandle(sortButtonRef.current)

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      query.invalidateQueries({ queryKey: ['useritems', item.Id] })
    })
    return unsubscribe
  }, [navigation])

  const list = useRef<FlatList>(null)
  const aspectRatio = findAspectRatio(item.CollectionType)
  const columns = aspectRatio === 'wide' ? 4 : 6

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {!isLoading && (
        <FlatList
          ref={list}
          data={data.Items}
          keyExtractor={(item: Item) => item.Id}
          renderItem={({ item, index }: { item: Item; index: number }) => (
            <ItemCard
              id={item.Id}
              title={item.Name}
              numberOfLines={2}
              aspectRatio={aspectRatio}
              image={
                client.server +
                '/Items/' +
                item.Id +
                '/Images/Primary?maxWidth=384&maxHeight=384'
              }
              blurhash={
                !!item.ImageBlurHashes.Primary
                  ? item.ImageBlurHashes.Primary[item.ImageTags.Primary]
                  : undefined
              }
              length={
                !item.IsFolder &&
                !ignoreLengths &&
                ticksToTime(item.RunTimeTicks)
              }
              progressPercentage={
                !item.IsFolder && item.UserData.Played
                  ? 100
                  : !item.IsFolder && item.UserData.PlayedPercentage
              }
              onFocus={() =>
                list.current.scrollToIndex({
                  index: Math.floor(index / columns), // FlatList
                  // index: Math.floor(index / columns) * columns, // FlashList
                  viewPosition: 0.5,
                  animated: true,
                })
              }
              onPress={() => {
                item.Type === 'Folder'
                  ? navigation.push('Folder', { item })
                  : navigation.push('Details', { item })
              }}
              width={width / columns - 32}
              style={[index < columns && { paddingTop: 64 }]}
              hasTVPreferredFocus={index === 0}
              nextFocusUp={index < columns ? sortButtonNode : undefined}
            />
          )}
          numColumns={columns}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          // estimatedItemSize={columns === 4 ? 178 : 253}
        />
      )}
      <BlurView
        blurType="dark"
        blurAmount={10}
        style={{
          width: width,
          paddingVertical: 12,
          paddingHorizontal: 32,
          position: 'absolute',
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 28 }} fontWeight={700}>
          {item.Name}
        </Text>
        <Button
          ref={sortButtonRef}
          icon={sortOrder === Order.Asc ? 'north' : 'south'}
          hasTVPreferredFocus={false}
          onPress={() => {
            setShowSortMenu(true)
          }}
        >
          Sort by {sortNames[sortBy]}
        </Button>
      </BlurView>
      {isLoading && <CenterLoading />}
      <Modal
        visible={showSortMenu}
        onRequestClose={() => {
          setShowSortMenu(false)
        }}
        transparent={true}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row-reverse',
            backgroundColor: '#00000080',
          }}
        >
          <View
            style={{
              backgroundColor: theme.background,
              width: 400,
              paddingHorizontal: 16,
            }}
          >
            <ScrollView>
              <Text
                style={{
                  fontSize: 24,
                  paddingLeft: 24,
                  paddingVertical: 16,
                }}
                fontWeight={700}
              >
                Sort by
              </Text>
              <ListButton
                title="Sort Name"
                icon="north"
                hasTVPreferredFocus={
                  sortBy === By.SortName && sortOrder === Order.Asc
                }
                onPress={() => {
                  sort.set(item.Id, By.SortName, Order.Asc)
                  setShowSortMenu(false)
                }}
              />
              <ListButton
                title="Sort Name"
                icon="south"
                hasTVPreferredFocus={
                  sortBy === By.SortName && sortOrder === Order.Desc
                }
                onPress={() => {
                  sort.set(item.Id, By.SortName, Order.Desc)
                  setShowSortMenu(false)
                }}
              />
              <ListButton
                title="Unsorted Name"
                icon="north"
                hasTVPreferredFocus={
                  sortBy === By.Name && sortOrder === Order.Asc
                }
                onPress={() => {
                  sort.set(item.Id, By.Name, Order.Asc)
                  setShowSortMenu(false)
                }}
              />
              <ListButton
                title="Unsorted Name"
                icon="south"
                hasTVPreferredFocus={
                  sortBy === By.Name && sortOrder === Order.Desc
                }
                onPress={() => {
                  sort.set(item.Id, By.Name, Order.Desc)
                  setShowSortMenu(false)
                }}
              />
              <ListButton
                title="Release Date"
                icon="north"
                hasTVPreferredFocus={
                  sortBy === By.ReleaseDate && sortOrder === Order.Asc
                }
                onPress={() => {
                  sort.set(item.Id, By.ReleaseDate, Order.Asc)
                  setShowSortMenu(false)
                }}
              />
              <ListButton
                title="Release Date"
                icon="south"
                hasTVPreferredFocus={
                  sortBy === By.ReleaseDate && sortOrder === Order.Desc
                }
                onPress={() => {
                  sort.set(item.Id, By.ReleaseDate, Order.Desc)
                  setShowSortMenu(false)
                }}
              />
              <ListButton
                title="Date Added"
                icon="north"
                hasTVPreferredFocus={
                  sortBy === By.DateAdded && sortOrder === Order.Asc
                }
                onPress={() => {
                  sort.set(item.Id, By.DateAdded, Order.Asc)
                  setShowSortMenu(false)
                }}
              />
              <ListButton
                title="Date Added"
                icon="south"
                hasTVPreferredFocus={
                  sortBy === By.DateAdded && sortOrder === Order.Desc
                }
                onPress={() => {
                  sort.set(item.Id, By.DateAdded, Order.Desc)
                  setShowSortMenu(false)
                }}
              />
              <ListButton
                title="Runtime"
                icon="north"
                hasTVPreferredFocus={
                  sortBy === By.Runtime && sortOrder === Order.Asc
                }
                onPress={() => {
                  sort.set(item.Id, By.Runtime, Order.Asc)
                  setShowSortMenu(false)
                }}
              />
              <ListButton
                title="Runtime"
                icon="south"
                hasTVPreferredFocus={
                  sortBy === By.Runtime && sortOrder === Order.Desc
                }
                onPress={() => {
                  sort.set(item.Id, By.Runtime, Order.Desc)
                  setShowSortMenu(false)
                }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

export default Folder
