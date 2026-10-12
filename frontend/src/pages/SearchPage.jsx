import "./SearchPage.css";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import { products } from "../data/products";

function SearchPage({
  addToCart,
  wishlist,
  toggleWishlist,
  products: catalogProducts,
}) {
  const [params] = useSearchParams();
  const query = params.get("q") || "";

  function normalize(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getProductText(product) {
    return Object.entries(product)
      .filter(([key]) => key !== "image")
      .map(([, value]) => {
        if (Array.isArray(value)) {
          return value.join(" ");
        }

        if (typeof value === "object" && value !== null) {
          return Object.values(value).join(" ");
        }

        return value;
      })
      .join(" ");
  }

  function wordsMatch(searchWord, productText) {
    if (productText.includes(searchWord)) {
      return true;
    }

    if (searchWord.length > 3) {
      if (
        productText.includes(
          searchWord.endsWith("s")
            ? searchWord.slice(0, -1)
            : searchWord + "s"
        )
      ) {
        return true;
      }
    }

    return false;
  }

  const results = useMemo(() => {
    const searchText = normalize(query);

    if (!searchText) {
      return [];
    }

    const searchWords = searchText.split(" ");

    return (catalogProducts || products).filter((product) => {
      const productText = normalize(getProductText(product));

      return searchWords.every((word) =>
        wordsMatch(word, productText)
      );
    });
  }, [query, catalogProducts]);

  return (
    <div className="page-shell">
      <div className="shop-heading">
        <h1>Search</h1>
      </div>

      {!query ? (
        <EmptyState
          title="Search for a product"
          text="Use the search box above to find products."
          link="/shop"
        />
      ) : results.length === 0 ? (
        <EmptyState
          title="No products found"
          text={`Nothing matched "${query}".`}
          link="/shop"
        />
      ) : (
        <>
          <p className="search-note">
            {results.length} result(s) for "{query}"
          </p>

          <div className="product-grid">
            {results.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default SearchPage;