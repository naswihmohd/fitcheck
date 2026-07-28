import { useEffect } from 'react';
import { Constants } from '../../../../general/constants/constants';

const ensureMeta = (attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
};

/** Applies base document SEO from Constants (title + description + social tags). */
const useAppSeo = () => {
  useEffect(() => {
    document.title = Constants.META_TITLE_APP;
    ensureMeta('name', 'description', Constants.META_DESCRIPTION_APP);
    ensureMeta('name', 'application-name', Constants.APP_SHORT_NAME);
    ensureMeta('property', 'og:title', Constants.META_TITLE_APP);
    ensureMeta('property', 'og:description', Constants.META_DESCRIPTION_APP);
    ensureMeta('name', 'twitter:title', Constants.META_TITLE_APP);
    ensureMeta('name', 'twitter:description', Constants.META_DESCRIPTION_APP);
  }, []);
};

export default useAppSeo;
