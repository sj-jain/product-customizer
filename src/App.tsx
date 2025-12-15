import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CustomizePage from './pages/CustomizePage';
import DocumentationPage from './pages/DocumentationPage';
import './index.css';

console.log('App component loading...');

function App() {
  console.log('App component rendering...');
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/customize" element={<CustomizePage />} />
        <Route path="/documentation" element={<DocumentationPage />} />
        <Route path="/documentation/:filename" element={<DocumentationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
