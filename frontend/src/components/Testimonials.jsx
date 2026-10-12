import { useState } from "react";
import "./Testimonials.css";

const testimonials = [
  {
    id: 1,
    name: "Priya Sharma",
    city: "Mumbai",
    rating: 5,
    text: "The saree quality is beautiful and the fitting was perfect. I loved the collection and will definitely shop again."
  },
  {
    id: 2,
    name: "Anjali Patel",
    city: "Ahmedabad",
    rating: 5,
    text: "I ordered a designer saree for a family function. The fabric and embroidery were even better than I expected."
  },
  {
    id: 3,
    name: "Neha Singh",
    city: "Delhi",
    rating: 5,
    text: "Very nice collection and fast delivery. The dress looked exactly like the pictures. Highly recommended!"
  },
  {
    id: 4,
    name: "Riya Mehta",
    city: "Pune",
    rating: 5,
    text: "I purchased a beautiful lehenga for my sister's wedding. The design was elegant and the quality was excellent."
  },
  {
    id: 5,
    name: "Kavita Shah",
    city: "Surat",
    rating: 5,
    text: "The collection is amazing. I received many compliments on my saree and the delivery was also very quick."
  },
  {
    id: 6,
    name: "Sneha Joshi",
    city: "Jaipur",
    rating: 5,
    text: "Beautiful clothes and very good finishing. The colours looked exactly like the website photos."
  },
  {
    id: 7,
    name: "Pooja Verma",
    city: "Bengaluru",
    rating: 5,
    text: "I loved my kurti set. It was comfortable, stylish and perfect for a festive occasion."
  },
  {
    id: 8,
    name: "Meera Desai",
    city: "Vadodara",
    rating: 5,
    text: "This was my second order and once again I was impressed. Great designs and very good fabric quality."
  },
  {
    id: 9,
    name: "Aarti Kapoor",
    city: "Chandigarh",
    rating: 5,
    text: "The lehenga was absolutely gorgeous. It looked premium and was perfect for my wedding function."
  },
  {
    id: 10,
    name: "Nisha Agarwal",
    city: "Kolkata",
    rating: 5,
    text: "I really enjoyed shopping here. The website was easy to use and my order arrived safely and on time."
  },
  {
    id: 11,
    name: "Divya Rao",
    city: "Hyderabad",
    rating: 5,
    text: "The saree was elegant and comfortable. I am very happy with my purchase and would recommend this store."
  },
  {
    id: 12,
    name: "Simran Kaur",
    city: "Amritsar",
    rating: 5,
    text: "Amazing festive collection! The embroidery, fabric and overall look were exactly what I wanted."
  }
];

function Testimonials() {
  const [startIndex, setStartIndex] = useState(0);

  const cardsToShow = 3;

  function nextTestimonials() {
    if (startIndex < testimonials.length - cardsToShow) {
      setStartIndex(startIndex + 1);
    }
  }

  function previousTestimonials() {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  }

  return (
    <section className="testimonials">

      <div className="testimonial-title">
        <span></span>

        <h2>
          What Our <strong>Customers</strong> Say
        </h2>

        <span></span>
      </div>

      <p className="testimonial-subtitle">
        Loved by thousands of customers across India
      </p>

      <div className="testimonial-slider">

        <button
          className="testimonial-arrow prev"
          onClick={previousTestimonials}
          disabled={startIndex === 0}
        >
          &#10094;
        </button>

        <div className="testimonial-window">
          <div
            className="testimonial-track"
            style={{
              transform: `translateX(-${startIndex * (100 / cardsToShow)}%)`
            }}
          >
            {testimonials.map((item) => (
              <div
                className="testimonial-card"
                key={item.id}
              >

                <div className="quote-mark">
                  “
                </div>

                <div className="stars">
                  {"★".repeat(item.rating)}
                </div>

                <p className="testimonial-text">
                  {item.text}
                </p>

                <div className="customer-info">

                  <div className="customer-avatar">
                    {item.name.charAt(0)}
                  </div>

                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.city}</p>
                  </div>

                </div>

              </div>
            ))}
          </div>
        </div>

        <button
          className="testimonial-arrow next"
          onClick={nextTestimonials}
          disabled={
            startIndex === testimonials.length - cardsToShow
          }
        >
          &#10095;
        </button>

      </div>

      <div className="testimonial-dots">
        {testimonials
          .slice(0, testimonials.length - cardsToShow + 1)
          .map((_, index) => (
            <button
              key={index}
              className={
                startIndex === index
                  ? "dot active"
                  : "dot"
              }
              onClick={() => setStartIndex(index)}
            ></button>
          ))}
      </div>

    </section>
  );
}

export default Testimonials;