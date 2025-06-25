import { createCache, StyleProvider } from '@ant-design/cssinjs';
import Document, { DocumentContext, Head, Html, Main, NextScript } from 'next/document';
import { doExtraStyle } from '../genAntdCss';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const cache = createCache();
    let fileName = '';
    const originalRenderPage = ctx.renderPage;
    ctx.renderPage = () =>
      originalRenderPage({
        enhanceApp: App => props => (
          <StyleProvider cache={cache} hashPriority='high'>
            <App {...props} />
          </StyleProvider>
        ),
      });
    const initialProps = await Document.getInitialProps(ctx);

    fileName = doExtraStyle({
      cache,
    });

    return {
      ...initialProps,
      styles: (
        <>
          {initialProps.styles}
          {/* 1.2 inject css */}
          {fileName && <link rel='stylesheet' href={`/${fileName}`} />}
        </>
      ),
    };
  }

  render() {
    return (
      <Html lang='en'>
        <Head>
          <link rel='icon' type='image/png' sizes='32x32' href='/LOGO_SMALL.png' />
          <link rel='icon' type='image/png' sizes='16x16' href='/LOGO_SMALL.png' />
          <link rel='apple-touch-icon' href='/LOGO_SMALL.png' />
          <meta name='description' content='Revolutionizing Database Interactions with Private LLM Technology' />
          <meta property='og:description' content='eosphoros-ai' />
          <meta property='og:title' content='DB-GPT' />
          {/* Google Fonts for modern look */}
          <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;700&family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
