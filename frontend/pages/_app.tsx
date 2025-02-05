import Head from 'next/head'
import '../public/globals.css'
import type { AppProps } from 'next/app'

function MyApp({
  Component,
  pageProps
}: AppProps) {
  return (
    <>
      <Head>
        <title>CareTracker</title>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
