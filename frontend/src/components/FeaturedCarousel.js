// src/components/FeaturedCarousel.js
import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './FeaturedCarousel.css';

function FeaturedCarousel({ items }) {
  // Example: show 3 slides, center mode, partial fade effect
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    centerMode: true,
    centerPadding: '100px',  // how much “peek” you want on the sides
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    // The next lines let us highlight the center slide with CSS
    beforeChange: (current, next) => {
      // no-op, but you can do debug or custom logic
    },
    afterChange: (index) => {
      // no-op, but you can do debug or custom logic
    },
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
          const finalUrl = `https://omegascans.org/series/${item.series_slug}`;
          return (
            <div key={item.id} className="featured-carousel-slide">
              <a
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="carousel-link"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="carousel-cover"
                />
                <h4 className="carousel-title">{item.title}</h4>
              </a>
            </div>
          );
        })}
      </Slider>
    </div>
  );
}

export default FeaturedCarousel;
