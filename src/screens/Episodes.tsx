import { useEffect, useRef, useState } from 'react'
import { FlatList, Image, View, useWindowDimensions } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import Item from 'jellyfin-api/lib/types/media/Item'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import useEpisodes from 'api/useEpisodes'
import useSpecialFeatures from 'api/useSpecialFeatures'
import Text from 'components/Text'
import ItemLong from 'components/ItemLong'
import CenterLoading from 'components/CenterLoading'

const Episodes = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Episodes'>) => {
  const { season, series, special } = route.params
  const client = useClient()
  const theme = useTheme()
  const { width, height } = useWindowDimensions()

  const params = !!season ? { SeasonId: season.Id } : {}
  const episodes = !special
    ? useEpisodes(series.Id, {
        ...params,
        Fields: 'Overview',
      })
    : null

  const specials = special
    ? useSpecialFeatures(season ? season.Id : series.Id)
    : null
  const [specialsSorted, setSpecialsSorted] = useState<Item[]>(null)

  const [primaryImage, setPrimaryImage] = useState(
    client.server + '/Items/' + series.Id + '/Images/Primary',
  )
  const [backdropImage, setBackdropImage] = useState(
    client.server + '/Items/' + series.Id + '/Images/Backdrop/0',
  )

  const episodeList = useRef<FlatList>(null)

  useEffect(() => {
    if (special && specials.data) {
      setSpecialsSorted(
        specials.data.sort((a, b) => a.SortName.localeCompare(b.SortName)),
      )
    }
  }, [specials])

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Image source={{ uri: backdropImage }} width={width} height={height} />
      <View
        style={{
          position: 'absolute',
          backgroundColor: '#000000A0',
          width: width,
          height: height,
        }}
      />
      <View style={{ position: 'absolute', width: width, height: height }}>
        {((!special && !episodes.isLoading) ||
          (special && !specials.isLoading && specialsSorted)) && (
          <FlatList
            ref={episodeList}
            data={special ? specialsSorted : episodes.data.Items}
            keyExtractor={(item: Item) => item.Id}
            renderItem={({ item, index }: { item: Item; index: number }) => (
              <ItemLong
                title={
                  special
                    ? item.Name
                    : item.ParentIndexNumber !== 0
                    ? item.IndexNumber + '. ' + item.Name
                    : 'Special: ' + item.Name
                }
                description={!special && item.Overview}
                image={client.server + '/Items/' + item.Id + '/Images/Primary'}
                imageFallback={
                  client.server + '/Items/' + series.Id + '/Images/Primary'
                }
                blurhash={
                  !!item.ImageBlurHashes.Primary
                    ? item.ImageBlurHashes.Primary[item.ImageTags.Primary]
                    : !!series.ImageBlurHashes.Primary
                    ? series.ImageBlurHashes.Primary[series.ImageTags.Primary]
                    : undefined
                }
                onPress={() => {
                  navigation.push('VideoDetails', { item: item })
                }}
                onFocus={() => {
                  episodeList.current.scrollToIndex({
                    index: index,
                    viewPosition: 0.5,
                  })
                }}
                hasTVPreferredFocus={index === 0}
                style={[
                  index === 0 && { paddingTop: 48 },
                  !special &&
                    index === episodes.data.Items.length - 1 && {
                      paddingBottom: 16,
                    },
                  special &&
                    index === specials.data.length - 1 && {
                      paddingBottom: 16,
                    },
                ]}
              />
            )}
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
          {!!season ? season.Name : series.Name}
        </Text>
      </View>

      {((!special && episodes.isLoading) ||
        (special && specials.isLoading) ||
        (special && !specialsSorted)) && <CenterLoading />}
    </View>
  )
}

export default Episodes
