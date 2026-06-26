import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ReserveView from './ReserveView';

export default function ReserveCarousel({ reserves, onEditClick }) { // Recebe a prop de edição
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!reserves || reserves.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === reserves.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? reserves.length - 1 : prevIndex - 1
        );
    };

    const currentReserve = reserves[currentIndex];

    return (
        <div className="carousel-container">
            
            {/* CONTROLOS LATERAIS FIXOS */}
            {reserves.length > 1 && (
                <>
                    <button 
                        type="button" 
                        className="carousel-arrow-btn left" 
                        onClick={prevSlide}
                        title="Previous accommodation"
                    >
                        <FaChevronLeft size={14} />
                    </button>

                    <button 
                        type="button" 
                        className="carousel-arrow-btn right" 
                        onClick={nextSlide}
                        title="Next accommodation"
                    >
                        <FaChevronRight size={14} />
                    </button>

                    <div className="carousel-pagination-badge">
                        {currentIndex + 1} / {reserves.length}
                    </div>
                </>
            )}

            {/* O CARTÃO ANIMADO */}
            <div key={currentIndex} className="carousel-slide-animate">
                {/* RENDERIZA A VIEW DIRETAMENTE PASSANDO O DISPARADOR DE EDIÇÃO */}
                <ReserveView 
                    reserve={currentReserve} 
                    onEditClick={() => onEditClick(currentReserve)} 
                />
            </div>
        </div>
    );
}
