import React from "react";
import Routes from "./Routes";
import { HelmetProvider } from 'react-helmet-async';
import ReactQueryProvider from './providers/ReactQueryProvider';



function App() {
  return (
    <ReactQueryProvider>
      <HelmetProvider>
       <Routes />
      </HelmetProvider>
    </ReactQueryProvider>

  );
}

export default App;
