import React, { useEffect, useMemo, useState } from 'react';
import './AdvertisementCarousel.css';

const AdvertisementCarousel = ({ slides = [], loading = false, autoPlayInterval = 3500 }) => {
  const hasMultipleSlides = slides.length > 1;
  const renderedSlides = useMemo(() => {
    if (!hasMultipleSlides) return slides;
    return [slides[slides.length - 1], ...slides, slides[0]];
  }, [slides, hasMultipleSlides]);

  const [currentIndex, setCurrentIndex] = useState(hasMultipleSlides ? 1 : 0);
  const [withTransition, setWithTransition] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const jumpWithoutAnimation = (nextIndex) => {
    setWithTransition(false);
    setCurrentIndex(nextIndex);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setWithTransition(true));
    });
  };

  useEffect(() => {
    if (!hasMultipleSlides || isPaused || loading) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, autoPlayInterval);

    return () => clearInterval(intervalId);
  }, [hasMultipleSlides, isPaused, loading, autoPlayInterval]);

  const handleTransitionEnd = () => {
    if (!hasMultipleSlides) return;

    if (currentIndex === slides.length + 1) {
      jumpWithoutAnimation(1);
    } else if (currentIndex === 0) {
      jumpWithoutAnimation(slides.length);
    }
  };

  const activeDotIndex =
    slides.length === 0 ? 0 : hasMultipleSlides ? (currentIndex - 1 + slides.length) % slides.length : 0;

  const handleDotClick = (dotIndex) => {
    if (!hasMultipleSlides) return;
    setCurrentIndex(dotIndex + 1);
  };

  if (loading) {
    return (
      <section className="ad-carousel ad-carousel--state" aria-label="Advertisement Carousel">
        <div className="ad-carousel__state">Loading advertisements...</div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="ad-carousel ad-carousel--state" aria-label="Advertisement Carousel">
        <div className="ad-carousel__state">No advertisements available right now.</div>
      </section>
    );
  }

  return (
    <section className="ad-carousel" aria-label="Advertisement Carousel">
      <div
        className="ad-carousel__viewport"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div
          className="ad-carousel__track"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: withTransition ? 'transform 700ms cubic-bezier(0.22, 0.61, 0.36, 1)' : 'none'
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {renderedSlides.map((slide, index) => {
            const title = slide?.title || 'Advertisement';
            const description = slide?.description || '';
            const author = slide?.teacher_name || 'Teacher';
            const buttonLabel = slide?.button_text || 'Learn More';
            const buttonLink = slide?.button_link || '';

            return (
              <article className="ad-carousel__slide" key={`${slide?.id ?? 'slide'}-${index}`}>
                <div className="ad-card">
                  <div className="ad-card__orb" aria-hidden="true">
                    AD
                  </div>
                  <div className="ad-card__body">
                    <span className="ad-card__badge">Advertisement</span>
                    <h3 className="ad-card__title">{title}</h3>
                    <p className="ad-card__description">{description}</p>
                    <p className="ad-card__author">By {author}</p>
                  </div>
                  <div className="ad-card__action">
                    <button
                      type="button"
                      className="ad-card__button"
                      disabled={!buttonLink}
                      onClick={() => {
                        if (!buttonLink) return;
                        window.open(buttonLink, '_blank', 'noopener,noreferrer');
                      }}
                    >
                      {buttonLabel}
                    </button>
                  </div>
                  <div className="ad-card__shine" aria-hidden="true" />
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="ad-carousel__dots" role="tablist" aria-label="Choose advertisement slide">
          {slides.map((slide, dotIndex) => (
            <button
              key={slide?.id ?? dotIndex}
              type="button"
              className={`ad-carousel__dot ${activeDotIndex === dotIndex ? 'is-active' : ''}`}
              aria-label={`Go to advertisement ${dotIndex + 1}`}
              aria-selected={activeDotIndex === dotIndex}
              onClick={() => handleDotClick(dotIndex)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default AdvertisementCarousel;
