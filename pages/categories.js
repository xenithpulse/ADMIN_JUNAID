import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from 'react-sweetalert2';

function Categories({ swal }) {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    axios.get('/api/categories')
      .then(result => {
        setCategories(result.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });
  }

  async function saveCategory(ev) {
    ev.preventDefault();
    if (!name) return; // Handle empty name

    const data = { name };

    try {
      if (editedCategory) {
        data._id = editedCategory._id;
        await axios.put('/api/categories', data);
        setEditedCategory(null);
      } else {
        await axios.post('/api/categories', data);
      }
      setName('');
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  }

  function editCategory(category) {
    setEditedCategory(category);
    setName(category.name);
  }

  function deleteCategory(category) {
    swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete ${category.name}?`,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Yes, Delete!',
      confirmButtonColor: '#d55',
      reverseButtons: true,
    }).then(async result => {
      if (result.isConfirmed) {
        const { _id } = category;
        if (_id) {
          try {
            await axios.delete(`/api/categories?_id=${_id}`);
            fetchCategories();
          } catch (error) {
            console.error('Error deleting category:', error);
          }
        } else {
          console.error('Invalid category ID');
        }
      }
    });
  }

  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit category ${editedCategory.name}`
          : 'Create new category'}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            type="text"
            placeholder={'Category name'}
            onChange={ev => setName(ev.target.value)}
            value={name}
          />
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName('');
              }}
              className="btn-default"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary py-1">
            Save
          </button>
        </div>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Category name</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 && categories.map(category => (
              <tr key={category._id}>
                <td>{category.name}</td>
                <td>
                  <button
                    onClick={() => editCategory(category)}
                    className="btn-default mr-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCategory(category)}
                    className="btn-red"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => (
  <Categories swal={swal} />
));
