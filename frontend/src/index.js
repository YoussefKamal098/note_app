import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {enableMapSet} from 'immer';
import GlobalSettingsProvider from './contexts/GlobalSettingsContext';
import ThemeProvider from "./contexts/ThemeContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <GlobalSettingsProvider>
            <ThemeProvider>
                <App/>
            </ThemeProvider>
        </GlobalSettingsProvider>
    </React.StrictMode>
);


// Enable Map/Set support for Immer
enableMapSet();
// If you want to start measuring performance in your app, pass a function
// to log results (for example, reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
