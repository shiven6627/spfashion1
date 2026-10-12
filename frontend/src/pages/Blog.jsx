import "./Blog.css";
import { asset } from "../utils/assets";

function Blog() {
  const posts = [
    {
      title: "How Do Designer Sarees add a touch of glamour to traditional looks?",
      image: "cat-1.jpg",
    },
    {
      title: "Why Embroidered Gowns are the ideal evening-wear staple",
      image: "cat-5.jpg",
    },
    {
      title: "How Do Salwar Kameez add a touch of glamour to traditional looks?",
      image: "cat-9.jpg",
    },
    {
      title: "Look at your work with these trending kurtis from SP Fashion",
      image: "cat-12.jpg",
    },
  ];

  return (
    <div className="page-shell blog-page">

      <div className="shop-heading">
        <h1>Blogs</h1>
      </div>

      <div className="blog-list">

        {posts.map((post) => (
          <article className="blog-card" key={post.title}>

            <img
              src={asset(post.image)}
              alt={post.title}
            />

            <div className="blog-content">

              <h2>
                {post.title}
              </h2>

              <p>
                Discover simple fashion ideas, styling
                tips and beautiful outfit inspiration
                from SP FASHION. Learn how to style
                traditional Indian outfits for different
                occasions and celebrations.
              </p>

              <button
                className="btn"
                type="button"
                onClick={() => alert("Blog article demo.")}
              >
                VIEW DETAILS
              </button>

            </div>

          </article>
        ))}

      </div>

    </div>
  );
}

export default Blog;