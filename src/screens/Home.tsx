import { useEffect, useRef, useState } from 'react'
import {
  FlatList,
  ScrollView,
  TVFocusGuideView,
  View,
  useWindowDimensions,
} from 'react-native'
import BootSplash from 'react-native-bootsplash'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import RootStackParamList from 'types/RootStackParamList'
import Item from 'jellyfin-api/lib/types/media/Item'
import { useQueryClient } from '@tanstack/react-query'
import useClient from 'hooks/useClient'
import useTheme from 'hooks/useTheme'
import useSettings from 'hooks/useSettings'
import useViews from 'api/useViews'
import useItemsResume from 'api/useItemsResume'
import useShowsNextup from 'api/useShowsNextup'
import deviceProfile from 'lib/deviceProfile'
import cardSubtitle from 'lib/cardSubtitle'
import ticksToTime from 'lib/ticksToTime'
import ItemCard from 'components/ItemCard'
import Text from 'components/Text'
import CenterLoading from 'components/CenterLoading'
import Button from 'components/Button'

const Home = ({
  navigation,
  route,
}: NativeStackScreenProps<RootStackParamList, 'Home'>) => {
  useEffect(() => {
    const hideSplash = async () => {
      await BootSplash.hide({ fade: true })
    }

    if (BootSplash.isVisible()) {
      hideSplash()
    }
  }, [])

  const client = useClient()
  const theme = useTheme()
  const settings = useSettings()
  const query = useQueryClient()
  const { height } = useWindowDimensions()
  const [resumeY, setReusmeY] = useState(0)

  const views = useViews()
  const resume = useItemsResume({ EnableImageTypes: 'Primary,Backdrop,Logo' })
  const nextup = useShowsNextup({ EnableImageTypes: 'Primary,Backdrop,Logo' })

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      query.invalidateQueries({ queryKey: ['views'] })
      query.invalidateQueries({ queryKey: ['itemsResume'] })
      query.invalidateQueries({ queryKey: ['showsNextup'] })
      setDeviceProfile()
    })
    return unsubscribe
  }, [navigation])

  const setDeviceProfile = async () => {
    const profile = await deviceProfile()
    settings.setDeviceProfile(profile)
    //console.log(JSON.stringify(profile))
  }

  const scrollView = useRef<ScrollView>(null)
  const viewsList = useRef<FlatList>(null)
  const resumeList = useRef<FlatList>(null)
  const nextupList = useRef<FlatList>(null)

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {!views.isLoading && !resume.isLoading && !nextup.isLoading && (
        <ScrollView ref={scrollView} showsVerticalScrollIndicator={false}>
          <View>
            <TVFocusGuideView trapFocusLeft trapFocusRight>
              <FlatList
                ref={viewsList}
                data={views.data}
                keyExtractor={(item: Item) => item.Id}
                renderItem={({
                  item,
                  index,
                }: {
                  item: Item
                  index: number
                }) => (
                  <ItemCard
                    id={item.Id}
                    title={item.Name}
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
                    onPress={() => {
                      navigation.push('Folder', {
                        item: item,
                        ignoreLengths: item.CollectionType === 'movies',
                      })
                    }}
                    onFocus={() => {
                      viewsList.current.scrollToIndex({
                        index: index,
                        viewPosition: 0.5,
                      })
                      scrollView.current.scrollTo({
                        x: 0,
                        y: 0,
                        animated: true,
                      })
                    }}
                    hasTVPreferredFocus={index === 0}
                  />
                )}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                initialNumToRender={4}
                style={{ paddingTop: 48 }}
              />
            </TVFocusGuideView>
            <Text
              style={{
                fontSize: 28,
                paddingTop: 12,
                paddingHorizontal: 32,
                position: 'absolute',
              }}
              fontWeight={700}
            >
              Libraries
            </Text>

            <View
              style={{
                position: 'absolute',
                paddingTop: 14,
                right: 16,
                flex: 1,
                flexDirection: 'row',
              }}
            >
              {/* <Button icon="update">Update</Button> */}
              <Button
                icon="settings"
                transparent
                onPress={() => {
                  navigation.push('Settings')
                }}
              />
            </View>
          </View>

          {resume.data &&
            'Items' in resume.data &&
            resume.data.Items.length > 0 && (
              <View
                onLayout={(event) => setReusmeY(event.nativeEvent.layout.y)}
              >
                <TVFocusGuideView trapFocusLeft trapFocusRight>
                  <FlatList
                    ref={resumeList}
                    data={resume.data.Items}
                    keyExtractor={(item: Item) => item.Id}
                    renderItem={({
                      item,
                      index,
                    }: {
                      item: Item
                      index: number
                    }) => (
                      <ItemCard
                        id={item.Id}
                        title={
                          item.Type === 'Episode' ? item.SeriesName : item.Name
                        }
                        subtitle={cardSubtitle(item)}
                        image={
                          client.server +
                          '/Items/' +
                          item.Id +
                          '/Images/Primary?maxWidth=384&maxHeight=384'
                        }
                        blurhash={
                          !!item.ImageBlurHashes.Primary
                            ? item.ImageBlurHashes.Primary[
                                item.ImageTags.Primary
                              ]
                            : undefined
                        }
                        length={ticksToTime(item.RunTimeTicks)}
                        progressPercentage={item.UserData.PlayedPercentage}
                        onFocus={() => {
                          resumeList.current.scrollToIndex({
                            index: index,
                            viewPosition: 0.5,
                          })
                          scrollView.current.scrollTo({
                            x: 0,
                            y: resumeY - height / 4,
                            animated: true,
                          })
                        }}
                        onPress={() => navigation.push('Details', { item })}
                      />
                    )}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={4}
                    style={{ paddingTop: 32 }}
                  />
                </TVFocusGuideView>
                <Text
                  style={{
                    fontSize: 28,
                    top: -4,
                    paddingHorizontal: 32,
                    position: 'absolute',
                  }}
                  fontWeight={700}
                >
                  Continue Watching
                </Text>
              </View>
            )}

          {nextup.data &&
            'Items' in nextup.data &&
            nextup.data.Items.length > 0 && (
              <View>
                <TVFocusGuideView trapFocusLeft trapFocusRight>
                  <FlatList
                    ref={nextupList}
                    data={nextup.data.Items}
                    keyExtractor={(item: Item) => item.Id}
                    renderItem={({
                      item,
                      index,
                    }: {
                      item: Item
                      index: number
                    }) => (
                      <ItemCard
                        id={item.Id}
                        title={item.SeriesName}
                        subtitle={cardSubtitle(item)}
                        image={
                          client.server +
                          '/Items/' +
                          item.Id +
                          '/Images/Primary?maxWidth=384&maxHeight=384'
                        }
                        blurhash={
                          !!item.ImageBlurHashes.Primary
                            ? item.ImageBlurHashes.Primary[
                                item.ImageTags.Primary
                              ]
                            : undefined
                        }
                        length={ticksToTime(item.RunTimeTicks)}
                        progressPercentage={item.UserData.PlayedPercentage}
                        onFocus={() => {
                          nextupList.current.scrollToIndex({
                            index: index,
                            viewPosition: 0.5,
                          })
                          scrollView.current.scrollToEnd({ animated: true })
                        }}
                        onPress={() => navigation.push('Details', { item })}
                      />
                    )}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    initialNumToRender={4}
                    style={{ paddingTop: 32 }}
                  />
                </TVFocusGuideView>
                <Text
                  style={{
                    fontSize: 28,
                    top: -4,
                    paddingHorizontal: 32,
                    position: 'absolute',
                  }}
                  fontWeight={700}
                >
                  Next Up
                </Text>
              </View>
            )}
        </ScrollView>
      )}

      {(views.isLoading || resume.isLoading || nextup.isLoading) && (
        <CenterLoading />
      )}
    </View>
  )
}

export default Home
