import Button from 'components/Button'
import { useRef } from 'react'
import { Text, View } from 'react-native'
import WebView, { WebViewMessageEvent } from 'react-native-webview'

const Test = () => {
  const webviewRef = useRef<WebView>(null)

  const sendMessage = (payload: any) => {
    webviewRef.current?.injectJavaScript(
      `(function() {
        document.dispatchEvent(new MessageEvent('message', {
          data: ${JSON.stringify(payload)}
        }));
      })();`,
    )
  }

  const onMessage = (payload: WebViewMessageEvent) => {
    let data: any
    try {
      data = JSON.parse(payload.nativeEvent.data)
    } catch (e) {}

    if (data) {
      if (data.type === 'Console') {
        console.info(`[Console] ${JSON.stringify(data.data)}`)
      } else {
        console.log(data)
      }
    }
  }

  return (
    <View style={{ flex: 1 }}>
      {/* <Button onPress={() => sendMessage({ event: 'test' })}>
        sendMessage
      </Button> */}
      <WebView
        ref={webviewRef}
        onMessage={onMessage}
        originWhitelist={['*']}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        source={{
          uri: 'file:///android_asset/libass/index.html',
          // uri: 'http://192.168.8.145:8080/index.html?24',
        }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
      />
    </View>
  )
}

export default Test
