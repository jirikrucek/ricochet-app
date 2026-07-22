import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import i18n from './localization/i18n';
import { router } from './router';
import './styles.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error(i18n.t('errors.rootContainerNotFound'));
}

createRoot(container).render(<RouterProvider router={router} />);
