import '../styles/globals.css';

import { useRouter } from 'next/router';
import { Provider } from 'react-redux';
import { useStore } from '../src/redux/store';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const store = useStore(pageProps.initialReduxState);

  return (
    <>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}

export default MyApp;
