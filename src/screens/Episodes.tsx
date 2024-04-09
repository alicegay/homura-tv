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

const Episodes = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Episodes'>) => {
  const { season, series, special } = route.params
  const client = useClient()
  const theme = useTheme()
  const { width, height } = useWindowDimensions()

  const params = !!season ? { SeasonId: season.Id } : {}
  const episode = !special
    ? useEpisodes(series.Id, {
        ...params,
        Fields: 'Overview',
      })
    : null

  const specials = special
    ? useSpecialFeatures(season ? season.Id : series.Id)
    : null

  const [primaryImage, setPrimaryImage] = useState(
    client.server + '/Items/' + series.Id + '/Images/Primary',
  )
  const [backdropImage, setBackdropImage] = useState(
    client.server + '/Items/' + series.Id + '/Images/Backdrop/0',
  )

  const episodeList = useRef<FlatList>(null)

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
        {((!special && !episode.isLoading) ||
          (special && specials.isLoading)) && (
          <FlatList
            ref={episodeList}
            data={special ? specials.data : episode.data.Items}
            keyExtractor={(item: Item) => item.Id}
            renderItem={({ item, index }: { item: Item; index: number }) => (
              <ItemLong
                title={
                  item.ParentIndexNumber !== 0
                    ? item.IndexNumber + '. ' + item.Name
                    : 'Special: ' + item.Name
                }
                description={item.Overview}
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
                    index === episode.data.Items.length - 1 && {
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
    </View>
  )
}

export default Episodes
