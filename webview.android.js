import React, { Component } from 'react'
import { Linking, WebView } from 'react-native'

class WebHtmlView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      height: props.height || 200
    }
  }

  _handleOnMessage(event) {
    const data = event.nativeEvent.data;
    const height = Number(data) || props.height || 200;
    console.log({ height })
    if (this.state.height !== height)
      this.setState({ height });
  }

  onShouldStartLoadWithRequest(event) {
    if (event.url.search('about:blank') !== -1) {
      return true
    } else {
      Linking.openURL(event.url)
      return false
    }
  }

  render() {
    let {source, autoHeight, style, innerCSS} = this.props;

    if (!source) {
      return null
    }

    const injectScript = `
        <script>;
        (function() {
          var wrapper = document.createElement("div");
          wrapper.id = "height-wrapper";
          while (document.body.firstChild) {
            wrapper.appendChild(document.body.firstChild);
          }
          document.body.appendChild(wrapper);
          function updateHeight() {
            window.__REACT_WEB_VIEW_BRIDGE.postMessage(wrapper.clientHeight);
          }
          updateHeight();
          window.addEventListener("load", function() {
            updateHeight();
            window.setTimeout(updateHeight, 1000);
          });
          window.addEventListener("resize", updateHeight);
        }());
      </script>
    `
    const startHtmlDoc = `
      <html><head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>${innerCSS}</style></head><body>
    `
    const endHtmlDoc = '</body></html>'

    if (source.html && autoHeight) {
      let finalHtmlDoc = startHtmlDoc +
                        '<div style="word-break:break-word">' +
                        source.html +
                        '</div>' +
                        injectScript +
                        endHtmlDoc

      source = Object.assign({}, source, {
        html: finalHtmlDoc
      })
    }

    return (
      <WebView
        source={source}
        style={[style, autoHeight ? {height: this.state.height + 25} : null]}
        automaticallyAdjustContentInsets={false}
        scrollEnabled={!autoHeight}
        javaScriptEnabled={autoHeight}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onShouldStartLoadWithRequest={this.onShouldStartLoadWithRequest}
        onMessage={this._handleOnMessage.bind(this)} />
    )
  }
}

WebHtmlView.defaultProps = {
  innerCSS: '',
  autoHeight: true
};

export default WebHtmlView
