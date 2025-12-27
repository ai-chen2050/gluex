import { AppProps } from 'next/app';
import Head from 'next/head';
import { FC, useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { ContextProvider } from '../contexts/ContextProvider';
import { LanguageProvider } from '../contexts/LanguageProvider';
import { AppBar } from '../components/AppBar';
import { ContentContainer } from '../components/ContentContainer';
import { Footer } from '../components/Footer';
import Notifications from '../components/Notification'
require('@solana/wallet-adapter-react-ui/styles.css');
require('../styles/globals.css');

import * as gtag from '../utils/gtag';

const App: FC<AppProps> = ({ Component, pageProps }) => {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = (url: string) => {
            gtag.pageview(url);
        };

        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    return (
        <>
          <Head>
            <title>GlueX Lite</title>
          </Head>

          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gtag.GA_ID}', { page_path: window.location.pathname });`}
          </Script>

          <LanguageProvider>
            <ContextProvider>
              <div className="flex flex-col h-screen">
                <Notifications />
                <AppBar/>
                <ContentContainer>
                  <Component {...pageProps} />
                  <Footer/>
                </ContentContainer>
              </div>
            </ContextProvider>
          </LanguageProvider>
        </>
    );
};

export default App;
