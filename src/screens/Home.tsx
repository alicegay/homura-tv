import { useRef } from 'react'
import { FlatList, ScrollView, View } from 'react-native'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import useViews from 'api/useViews'
import ItemCard from 'components/ItemCard'
import Text from 'components/Text'
import useItemsResume from 'api/useItemsResume'
import useShowsNextup from 'api/useShowsNextup'
import Item from 'jellyfin-api/lib/types/media/Item'
import cardSubtitle from 'lib/cardSubtitle'

const Home = () => {
  const client = useClient()
  const theme = useTheme()
  const views = useViews()
  const resume = useItemsResume()
  const nextup = useShowsNextup()

  const viewsList = useRef<FlatList>()
  const resumeList = useRef<FlatList>()
  const nextupList = useRef<FlatList>()

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: '#222',
            paddingVertical: 4,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 28 }} fontWeight={700}>
            Libraries
          </Text>
        </View>
        {!views.isLoading && (
          <FlatList
            ref={viewsList}
            data={views.data}
            renderItem={({ item, index }: { item: Item; index: number }) => (
              <ItemCard
                title={item.Name}
                image={client.server + '/Items/' + item.Id + '/Images/Primary'}
                blurhash={
                  !!item.ImageBlurHashes.Primary
                    ? item.ImageBlurHashes.Primary[item.ImageTags.Primary]
                    : undefined
                }
                onFocus={() => {
                  viewsList.current.scrollToIndex({
                    index: index,
                    viewPosition: 0.5,
                  })
                }}
                hasTVPreferredFocus={index === 0}
              />
            )}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        )}
        <View
          style={{
            backgroundColor: '#222',
            paddingVertical: 4,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 28 }} fontWeight={700}>
            Continue Watching
          </Text>
        </View>
        {!resume.isLoading && (
          <FlatList
            ref={resumeList}
            data={resume.data.Items}
            renderItem={({ item, index }: { item: Item; index: number }) => (
              <ItemCard
                title={item.Type === 'Episode' ? item.SeriesName : item.Name}
                subtitle={cardSubtitle(item)}
                image={client.server + '/Items/' + item.Id + '/Images/Primary'}
                blurhash={
                  !!item.ImageBlurHashes.Primary
                    ? item.ImageBlurHashes.Primary[item.ImageTags.Primary]
                    : undefined
                }
                onFocus={() => {
                  resumeList.current.scrollToIndex({
                    index: index,
                    viewPosition: 0.5,
                  })
                }}
              />
            )}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        )}
        <View
          style={{
            backgroundColor: '#222',
            paddingVertical: 4,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 28 }} fontWeight={700}>
            Next Up
          </Text>
        </View>
        {!nextup.isLoading && (
          <FlatList
            ref={nextupList}
            data={nextup.data.Items}
            renderItem={({ item, index }: { item: Item; index: number }) => (
              <ItemCard
                title={item.SeriesName}
                subtitle={cardSubtitle(item)}
                image={client.server + '/Items/' + item.Id + '/Images/Primary'}
                blurhash={
                  !!item.ImageBlurHashes.Primary
                    ? item.ImageBlurHashes.Primary[item.ImageTags.Primary]
                    : undefined
                }
                onFocus={() => {
                  nextupList.current.scrollToIndex({
                    index: index,
                    viewPosition: 0.5,
                  })
                }}
              />
            )}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </ScrollView>
    </View>
  )
}

export default Home
