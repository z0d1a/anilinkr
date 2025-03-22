// src/components/FeaturedComickCarousel.js
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './FeaturedCarousel.css'; 
// ^ Reuse your existing carousel CSS or create a new file if you prefer

function FeaturedComickCarousel({ items }) {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    centerMode: true,
    centerPadding: '100px',
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          centerPadding: '60px',
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          centerPadding: '40px',
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className="featured-carousel-container">
      <Slider {...settings}>
        {items.map((item) => {
          // item may have: { slug, title, md_covers: [{ b2key: ... }] ... }
          // Build the cover URL from b2key
          let coverUrl = '';
          if (item.md_covers && item.md_covers.length > 0) {
            const b2key = item.md_covers[0].b2key;
            coverUrl = `https://meo.comick.pictures/${b2key}`;
          } else {
            // fallback or placeholder
            coverUrl = 'https://via.placeholder.com/200x300?text=No+Cover';
          }

          // For direct link on Comick: e.g. https://comick.io/comic/<slug>
          const finalUrl = item.slug
            ? `https://comick.io/comic/${item.slug}`
            : '#';

          return (
            <div key={item.id} className="featured-carousel-slide">
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="carousel-link"
              >
                <img
                  src={coverUrl}
                  alt={item.title || 'No Title'}
                  className="carousel-cover"
                />
                <h4 className="carousel-title">
                  {item.title || 'No Title'}
                </h4>
              </a>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}

export default FeaturedComickCarousel;
