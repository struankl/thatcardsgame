import React from 'react';
import { Provider } from 'react-redux';
import './App.css';
import { store } from './store';
import { GamePage } from './pages/GamePage';
import { DndProvider } from 'react-dnd';
import Backend from 'react-dnd-html5-backend';
import { ThemeProvider } from 'react-jss';

import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';
import ReduxToastr from 'react-redux-toastr';

const theme = {
  background: '#f7df1e',
  color: '#24292e',
};

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <DndProvider backend={Backend}>
            <GamePage />
            <ReduxToastr
              timeOut={4000}
              newestOnTop
              preventDuplicates
              position="top-left"
              transitionIn="fadeIn"
              transitionOut="fadeOut"
              progressBar
              closeOnToastrClick
            />
          </DndProvider>
        </ThemeProvider>
      </Provider>
    </div>
  );
}

export default App;
