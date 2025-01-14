import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta name="og:title" property="og:title" content="Personalbedarfsplanung"/>
          <link rel="icon" href="/favicon.png"/>
        </Head>
        <body>
          <Main/>
          <NextScript/>
        </body>
      </Html>
    )
  }
}

export default MyDocument
