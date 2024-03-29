import { useRef } from 'react'
import { FlatList, ScrollView, View } from 'react-native'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import useViews from 'api/useViews'
import ItemCard from 'components/ItemCard'
import Text from 'components/Text'

const Home = () => {
  const client = useClient()
  const theme = useTheme()
  const views = useViews()

  const viewsList = useRef<FlatList>()

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            backgroundColor: '#333',
            paddingVertical: 4,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 32 }} fontWeight={700}>
            Libraries
          </Text>
        </View>
        {!views.isLoading && (
          <FlatList
            ref={viewsList}
            data={views.data}
            renderItem={({ item, index }) => (
              <ItemCard
                key={item.Id}
                title={item.Name}
                image={client.server + '/Items/' + item.Id + '/Images/Primary'}
                blurhash={
                  !!item.ImageBlurHashes.Primary
                    ? item.ImageBlurHashes.Primary[item.ImageTags.Primary]
                    : undefined
                }
                style={{
                  marginTop: 16,
                }}
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
            backgroundColor: '#333',
            paddingVertical: 4,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 32 }} fontWeight={700}>
            Continue Watching
          </Text>
        </View>
        <View
          style={{
            backgroundColor: '#333',
            paddingVertical: 4,
            paddingHorizontal: 32,
          }}
        >
          <Text style={{ fontSize: 32 }} fontWeight={700}>
            Next Up
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default Home
