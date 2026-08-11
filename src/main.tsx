import { createRoot } from 'react-dom/client';
import { AppProviders } from './app/providers/AppProviders';
import i18n from './localization/i18n';
import './styles/globals.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error(i18n.t('errors.rootContainerNotFound'));
}

createRoot(container).render(<AppProviders />);
