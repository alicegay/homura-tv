import { useEffect, useRef } from 'react'
import { FlatList, View, useWindowDimensions } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import useUserItems from 'api/useUserItems'
import ItemCard from 'components/ItemCard'
import Text from 'components/Text'
import findAspectRatio from 'lib/findAspectRatio'
import Item from 'jellyfin-api/lib/types/media/Item'
import ticksToTime from 'lib/ticksToTime'
import CenterLoading from 'components/CenterLoading'
import { useQueryClient } from '@tanstack/react-query'

const Folder = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Folder'>) => {
  const client = useClient()
  const theme = useTheme()
  const query = useQueryClient()
  const { width } = useWindowDimensions()

  const { item, ignoreLengths } = route.params
  const { data, isLoading, isRefetching } = useUserItems(item.Id, {
    SortBy: 'IsFolder,SortName',
    SortOrder: 'Ascending',
    Fields: 'OriginalTitle',
    EnableImageTypes: 'Primary,Backdrop,Logo',
  })

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      query.invalidateQueries({ queryKey: ['useritems', item.Id] })
    })
    return unsubscribe
  }, [navigation])

  const list = useRef<FlatList>()
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
                  //index: Math.floor(index / columns) * columns, // FlashList
                  viewPosition: 0.5,
                  animated: true,
                })
              }
              onPress={() => {
                item.Type === 'Folder'
                  ? navigation.push('Folder', { item })
                  : navigation.push('Details', { item })
              }}
              hasTVPreferredFocus={index === 0}
              width={width / columns - 32}
              style={[index < columns && { paddingTop: 48 }]}
            />
          )}
          numColumns={columns}
          showsVerticalScrollIndicator={false}
          refreshing={isRefetching}
          //estimatedItemSize={columns === 4 ? 178 : 253}
        />
      )}
      <Text
        style={{
          fontSize: 28,
          paddingTop: 12,
          paddingHorizontal: 32,
          position: 'absolute',
        }}
        fontWeight={700}
      >
        {item.Name}
      </Text>
      {isLoading && <CenterLoading />}
    </View>
  )
}

export default Folder
