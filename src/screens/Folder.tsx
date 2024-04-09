import { FlatList, View, useWindowDimensions } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import useItems from 'api/useItems'
import ItemCard from 'components/ItemCard'
import Item from 'jellyfin-api/lib/types/media/Item'
import findAspectRatio from 'lib/findAspectRatio'
import Text from 'components/Text'
import { useRef } from 'react'
import ticksToTime from 'lib/ticksToTime'

const Folder = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Folder'>) => {
  const client = useClient()
  const theme = useTheme()
  const { width } = useWindowDimensions()

  const { item, ignoreLengths } = route.params
  const { data, isLoading } = useItems(item.Id, {
    SortBy: 'IsFolder,SortName',
    SortOrder: 'Ascending',
    Fields: 'OriginalTitle',
    EnableImageTypes: 'Primary,Backdrop,Logo',
  })

  const list = useRef<FlatList>()
  const aspectRatio = findAspectRatio(item.CollectionType)
  const columns = aspectRatio === 'wide' ? 4 : 6

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {!isLoading && (
        <FlatList
          ref={list}
          data={data.Items}
          renderItem={({ item, index }: { item: Item; index: number }) => (
            <ItemCard
              title={item.Name}
              numberOfLines={2}
              aspectRatio={aspectRatio}
              image={client.server + '/Items/' + item.Id + '/Images/Primary'}
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
                !item.IsFolder && item.UserData.PlayedPercentage
              }
              onFocus={() =>
                list.current.scrollToIndex({
                  index: Math.floor(index / columns),
                  viewPosition: 0.5,
                })
              }
              onPress={() => {
                item.Type === 'Folder'
                  ? navigation.push('Folder', { item })
                  : navigation.push('VideoDetails', { item })
              }}
              hasTVPreferredFocus={index === 0}
              width={width / columns - 32}
              style={[index < columns && { paddingTop: 48 }]}
            />
          )}
          numColumns={columns}
          showsVerticalScrollIndicator={false}
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
    </View>
  )
}

export default Folder
