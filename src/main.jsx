import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './store/AppContext.jsx';
import { I18nProvider } from './i18n/index.jsx';
import './styles/base.css';
import './styles/components.css';
import './styles/child.css';
import './styles/parent.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <I18nProvider>
          <App />
        </I18nProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);
