import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ReserveCard from './index';

export default function AccommodationCarousel({ reserves }) {
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
            
            {/* CONTROLOS LATERAIS FIXOS: Só aparecem se houver mais do que 1 alojamento */}
            {reserves.length > 1 && (
                <>
                    {/* Seta Esquerda (Previous) */}
                    <button 
                        type="button" 
                        className="carousel-arrow-btn left" 
                        onClick={prevSlide}
                        title="Previous accommodation"
                    >
                        <FaChevronLeft size={14} />
                    </button>

                    {/* Seta Direita (Next) */}
                    <button 
                        type="button" 
                        className="carousel-arrow-btn right" 
                        onClick={nextSlide}
                        title="Next accommodation"
                    >
                        <FaChevronRight size={14} />
                    </button>

                    {/* Pequeno indicador "1 of 2" flutuante e centrado no fundo interno */}
                    <div className="carousel-pagination-badge">
                        {currentIndex + 1} / {reserves.length}
                    </div>
                </>
            )}

            {/* O CARTÃO ANIMADO */}
            <div key={currentIndex} className="carousel-slide-animate">
                <ReserveCard reserve={currentReserve} />
            </div>
        </div>
    );
}
