import "./Contact.css";

function Contact() {
  function submit(e) {
    e.preventDefault();

    alert("Thanks! Your message has been sent.");

    e.currentTarget.reset();
  }

  return (
    <div className="page-shell contact-page">

      <div className="shop-heading">
        <h1>Contact</h1>
      </div>

      <div className="contact-layout">

        <form
          className="contact-form"
          onSubmit={submit}
        >

          <label>
            Name

            <input
              type="text"
              placeholder="Your name"
              required
            />
          </label>

          <label>
            Phone Number

            <input
              type="tel"
              placeholder="Phone number"
              required
            />
          </label>

          <label>
            E-mail

            <input
              type="email"
              placeholder="Email"
              required
            />
          </label>

          <label>
            Comment

            <textarea
              placeholder="Write your message"
              required
            ></textarea>
          </label>

          <button
            className="btn"
            type="submit"
          >
            SEND MESSAGE
          </button>

        </form>

        <div className="contact-info">

          <h2>Get In Touch!</h2>

          <p>
            <strong>SP FASHION</strong>
          </p>

          <p>
            Surat, Gujarat, India
          </p>

          <p>
            Tel: +91 90000 99900
          </p>

          <p>
            support@spfashion.com
          </p>

          <div className="contact-hours">

            <strong>Opening Hours</strong>

            <p>
              Monday to Saturday
            </p>

            <p>
              10:00 AM - 7:00 PM
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Contact;