import { useRef, useState } from 'react'
import { FlatList, Image, View, useWindowDimensions } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import Item from 'jellyfin-api/lib/types/media/Item'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import useSeasons from 'api/useSeasons'
import ItemCard from 'components/ItemCard'
import Text from 'components/Text'

const Season = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Season'>) => {
  const { series } = route.params
  const client = useClient()
  const theme = useTheme()
  const { width, height } = useWindowDimensions()

  const { data, isLoading } = useSeasons(series.Id)

  const [primaryImage, setPrimaryImage] = useState(
    client.server + '/Items/' + series.Id + '/Images/Primary',
  )
  const [backdropImage, setBackdropImage] = useState(
    client.server + '/Items/' + series.Id + '/Images/Backdrop/0',
  )

  const seasonList = useRef<FlatList>(null)

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
      <View style={{ position: 'absolute', bottom: 16, width: width }}>
        {!isLoading && (
          <FlatList
            ref={seasonList}
            data={data.Items}
            keyExtractor={(item: Item) => item.Id}
            renderItem={({ item, index }: { item: Item; index: number }) => (
              <ItemCard
                title={item.Name}
                aspectRatio="tall"
                width={192}
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
                strongShadow={true}
                onPress={() => {
                  navigation.push('Episodes', { season: item, series: series })
                }}
                onFocus={() => {
                  seasonList.current.scrollToIndex({
                    index: index,
                    viewPosition: 0.5,
                  })
                }}
                hasTVPreferredFocus={index === 0}
              />
            )}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={{ paddingTop: 48 }}
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
          {series.Name}
        </Text>
      </View>
    </View>
  )
}

export default Season
