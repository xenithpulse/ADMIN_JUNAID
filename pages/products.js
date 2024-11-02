import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // State for categories
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    // Fetch all products
    axios.get("/api/products").then((response) => {
      setProducts(response.data);
    });

    // Fetch all categories
    axios.get("/api/categories").then((response) => {
      setCategories(response.data);
    });
  }, []);

  // Function to handle category filter change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  // Function to handle the featured status update for a product
  const handleFeaturedChange = async (productId, isFeatured) => {
    try {
      await axios.put('/api/products', { _id: productId, featured: isFeatured });
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product._id === productId ? { ...product, featured: isFeatured } : product
        )
      );
    } catch (error) {
      console.error("Error updating featured status", error);
    }
  };

  // Filter products based on the selected category
  const filteredProducts = selectedCategory === "All" 
    ? products 
    : selectedCategory === "Featured"
      ? products.filter(product => product.featured)
      : products.filter((product) => product.category === selectedCategory);

  // Get the count of filtered products
  const productCount = filteredProducts.length;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <Link className="btn-primary text-white" href={"/products/new"}>
          Add new product
        </Link>
        
        {/* Category Filter Dropdown */}
        <select 
          className="border border-gray-300 rounded p-2"
          value={selectedCategory}
          onChange={handleCategoryChange}
          style={{width:"300px", height:"40px"}}
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
          <option value="Featured">Featured Products</option>
        </select>
      </div>


      <table className="basic mt-2">
        <thead>
          <tr>
            <th>Product ({productCount})</th>
            <th>Category</th>
            <th>Featured (8 Max)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => {
            // Get category name based on category ID
            const category = categories.find((cat) => cat._id === product.category);

            return (
              <tr key={product._id}>
                <td>{product.title}</td>
                <td>{category ? category.name : "Uncategorized"}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={product.featured || false}
                    onChange={(e) => handleFeaturedChange(product._id, e.target.checked)}
                  />
                </td>
                <td>
                  <Link className="btn-default ml-2" href={"/products/edit/" + product._id}>
                    Edit
                  </Link>
                  <Link className="btn-red ml-2" href={"/products/delete/" + product._id}>
                    Delete
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Layout>
  );
}
