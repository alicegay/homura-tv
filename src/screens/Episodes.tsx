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
import useItems from 'api/useItems'
import ticksToTime from 'lib/ticksToTime'
import { useQueryClient } from '@tanstack/react-query'

const Episodes = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Episodes'>) => {
  const { season, series, special } = route.params
  const client = useClient()
  const theme = useTheme()
  const query = useQueryClient()
  const { width, height } = useWindowDimensions()

  const seasonDetails = !special ? useItems(season.Id) : null

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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!special) {
        query.invalidateQueries({ queryKey: ['items', season.Id] })
        query.invalidateQueries({ queryKey: ['episodes', series.Id, params] })
      } else {
        query.invalidateQueries({
          queryKey: ['seasons', season ? season.Id : series.Id],
        })
      }
    })
    return unsubscribe
  }, [navigation])

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
        {((!special && !episodes.isLoading && !seasonDetails.isLoading) ||
          (special && !specials.isLoading)) && (
          <FlatList
            ref={episodeList}
            data={special ? specials.data : episodes.data.Items}
            keyExtractor={(item: Item) => item.Id}
            ListHeaderComponent={
              !special &&
              seasonDetails.data?.SpecialFeatureCount > 0 && (
                <ItemLong
                  id="specials"
                  title="Special Features"
                  image={
                    client.server + '/Items/' + series.Id + '/Images/Backdrop/0'
                  }
                  onPress={() => {
                    navigation.push('Episodes', {
                      season: seasonDetails.data,
                      series: series,
                      special: true,
                    })
                  }}
                  style={{ paddingTop: 48 }}
                />
              )
            }
            renderItem={({ item, index }: { item: Item; index: number }) => (
              <ItemLong
                id={item.Id}
                title={
                  special
                    ? item.Name
                    : item.ParentIndexNumber !== 0
                      ? item.IndexNumber + '. ' + item.Name
                      : 'Special: ' + item.Name
                }
                description={!special && item.Overview}
                image={
                  client.server +
                  '/Items/' +
                  item.Id +
                  '/Images/Primary?maxWidth=384&maxHeight=384'
                }
                // imageFallback={
                //   client.server +
                //   '/Items/' +
                //   series.Id +
                //   '/Images/Primary?maxWidth=384&maxHeight=384'
                // }
                blurhash={
                  !!item.ImageBlurHashes.Primary
                    ? item.ImageBlurHashes.Primary[item.ImageTags.Primary]
                    : !!series.ImageBlurHashes.Primary
                      ? series.ImageBlurHashes.Primary[series.ImageTags.Primary]
                      : undefined
                }
                length={ticksToTime(item.RunTimeTicks)}
                progressPercentage={
                  item.UserData.Played ? 100 : item.UserData.PlayedPercentage
                }
                onPress={() => {
                  navigation.push('Details', { item: item })
                }}
                onFocus={() => {
                  episodeList.current.scrollToIndex({
                    index: index,
                    viewPosition: 0.5,
                    animated: true,
                  })
                }}
                hasTVPreferredFocus={index === 0}
                style={[
                  !special &&
                    seasonDetails.data?.SpecialFeatureCount === 0 &&
                    index === 0 && { paddingTop: 48 },
                  !!special && index === 0 && { paddingTop: 48 },
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
            // estimatedItemSize={138}
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
          {!!special
            ? 'Special Features'
            : !!season
              ? season.Name
              : series.Name}
        </Text>
      </View>

      {((!special && episodes.isLoading) ||
        (!special && seasonDetails.isLoading) ||
        (special && specials.isLoading)) && <CenterLoading />}
    </View>
  )
}

export default Episodes
