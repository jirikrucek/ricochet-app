import { createRoot } from 'react-dom/client';
import App from './App';
import i18n from './localization/i18n';
import './styles.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error(i18n.t('errors.rootContainerNotFound'));
}

createRoot(container).render(<App />);
