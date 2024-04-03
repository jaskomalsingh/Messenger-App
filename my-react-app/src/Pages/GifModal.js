// GifModal.js
import React from 'react';
import '../Styles/GifModal.css'; // Make sure this path is correct

const GifModal = ({ isOpen, gifs, onSelect, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="gif-modal">
      <div className="gif-modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <div className="gifs-container">
          {gifs.map((gif, index) => (
            <img key={index} src={gif} alt={`gif-${index}`} onClick={() => onSelect(gif)} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GifModal;
