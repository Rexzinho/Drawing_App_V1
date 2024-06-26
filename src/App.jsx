import React from 'react';
import DrawingApp from './DrawingApp';

import DrawingProvider from './contexts/DrawingContext';

const App = () => {
  return (
    <DrawingProvider>
        <DrawingApp/>
    </DrawingProvider>
  )
}

export default App