import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>E-commerce Platform</h1>
        <p>Aplicação em desenvolvimento...</p>
      </div>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
      />
    </Router>
  );
}

export default App;
