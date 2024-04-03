import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap'; // Assuming you're using React Bootstrap
import AuthPage from './Pages/AuthPage'; // Importing AuthPage from the Pages folder
import ChatroomPage from './Pages/ChatroomPage';
import Instagram from './Pages/Instagram';

const App = () => {
  return (
    <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
      <BrowserRouter>
        {/*<Header />*/}
        <Routes>
          <Route path="/" element={<AuthPage />} /> {/* Adding AuthPage to your routes */}
          <Route path="/chat" element={<ChatroomPage />} /> {/* Adding AuthPage to your routes */}
          <Route path="/Instagram" element={<Instagram />} />
        </Routes>
      </BrowserRouter>
    </Container>
  );
}

export default App;
