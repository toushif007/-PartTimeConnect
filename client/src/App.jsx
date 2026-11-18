import React from 'react';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <>
      <Navbar />
      <div style={{ flex: 1 }}>
        <AppRoutes />
      </div>
      <Footer />
    </>
  );
}

export default App;
