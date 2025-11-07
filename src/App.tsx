import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AlbumReview } from './components/AlbumReview';
import { Gallery } from './components/Gallery';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AlbumReview />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

