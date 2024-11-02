import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";
import { useState, useEffect } from "react";

export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  discounted_percentage: existingdiscount,
  images: existingImages,
  category: assignedCategory,
  properties: assignedProperties,
}) {
  const [title, setTitle] = useState(existingTitle || '');
  const [description, setDescription] = useState(existingDescription || '');
  const [category, setCategory] = useState(assignedCategory || '');
  const [price, setPrice] = useState(existingPrice || '');
  const [discounted_percentage, setdiscounted_percentage] = useState(existingdiscount || '');
  const [images, setImages] = useState(existingImages || []);
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [prePropertiesNames, setprePropertiesNames] = useState(assignedProperties ? Object.keys(assignedProperties) : []);
  const [customProperties, setCustomProperties] = useState(Array.isArray(assignedProperties) ? assignedProperties : []);
  const router = useRouter();

  useEffect(() => {
    let newProps = [];
    prePropertiesNames.map((pn, indx) => {
      const prop = {
        name: pn,
        options: assignedProperties[pn],
      };
      newProps.push(prop);
    });

    setCustomProperties(newProps);
  }, [prePropertiesNames]);

  useEffect(() => {
    axios.get('/api/categories')
      .then(result => setCategories(result.data))
      .catch(error => console.error('Error fetching categories:', error));
  }, []);

  useEffect(() => {
    if (category) {
      const catInfo = categories.find(({ _id: id }) => id === category);
      if (catInfo && Array.isArray(catInfo.properties)) {
        setCustomProperties(catInfo.properties.map(p => ({
          ...p,
          options: p.values || [''],
        })));
      }
    }
  }, [category, categories]);

  async function saveProduct(ev) {
    ev.preventDefault();
    if (!title || !price || !category) {
      alert('Title, price, and category are required fields.');
      return;
    }

    const data = {
      title,
      description,
      price,
      discounted_percentage,
      images,
      category,
      properties: customProperties.reduce((acc, property) => {
        if (property.name && Array.isArray(property.options)) {
          acc[property.name] = property.options;
        }
        return acc;
      }, {}),
    };

    try {
      if (_id) {
        await axios.put('/api/products', { ...data, _id });
      } else {
        await axios.post('/api/products', data);
      }
      router.push('/products'); // Redirect to products page on successful save
    } catch (error) {
      console.error('Error saving product:', error.response?.data || error.message);
    }
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (files?.length > 0) {
      setIsUploading(true);
      const data = new FormData();
      for (const file of files) {
        data.append('file', file);
      }
      try {
        const res = await axios.post('/api/upload', data);
        setImages(oldImages => [...oldImages, ...res.data.links]);
      } catch (error) {
        console.error('Error uploading images:', error);
      } finally {
        setIsUploading(false);
      }
    }
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  function deleteImage(index) {
    setImages(oldImages => oldImages.filter((_, i) => i !== index));
  }

  function addProperty() {
    setCustomProperties([...customProperties, { name: '', options: [''] }]);
  }

  function updateProperty(index, field, value) {
    const updatedProperties = [...customProperties];
    updatedProperties[index][field] = value;
    setCustomProperties(updatedProperties);
  }

  function addOption(index) {
    const updatedProperties = [...customProperties];
    updatedProperties[index].options.push('');
    setCustomProperties(updatedProperties);
  }

  function updateOption(propertyIndex, optionIndex, value) {
    const updatedProperties = [...customProperties];
    updatedProperties[propertyIndex].options[optionIndex] = value;
    setCustomProperties(updatedProperties);
  }

  function removeOption(propertyIndex, optionIndex) {
    const updatedProperties = [...customProperties];
    updatedProperties[propertyIndex].options.splice(optionIndex, 1);
    setCustomProperties(updatedProperties);
  }

  function removeProperty(index) {
    const updatedProperties = [...customProperties];
    updatedProperties.splice(index, 1);
    setCustomProperties(updatedProperties);
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product name</label>
      <input
        type="text"
        placeholder="Product name"
        value={title}
        onChange={ev => setTitle(ev.target.value)}
      />

      <label>Category</label>
      <select placeholder=" Select category" value={category} onChange={ev => setCategory(ev.target.value)}>
        {categories.length > 0 && categories.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>

      <label>Custom Properties</label>
      {customProperties.map((property, index) => (
        <div key={index} className="mb-4">
          <input
            type="text"
            placeholder="Property name"
            value={property.name}
            onChange={ev => updateProperty(index, 'name', ev.target.value)}
            className="w-full mb-2"
          />

          {property.options.map((option, optionIndex) => (
            <div key={optionIndex} className="flex items-center mb-2">
              <input
                type="text"
                placeholder="Option"
                value={option}
                onChange={ev => updateOption(index, optionIndex, ev.target.value)}
                className="w-full"
              />
              <button
                type="button"
                onClick={() => removeOption(index, optionIndex)}
                className="ml-2 text-red-500">
                Remove
              </button>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => addOption(index)}
              className="mr-2 text-blue-500">
              Add Option
            </button>
            <button
              type="button"
              onClick={() => removeProperty(index)}
              className="text-red-500">
              Remove Property
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addProperty}
        className="mb-6 text-green-500">
        Add Property
      </button>

      <div className="mb-4 flex flex-wrap">
        <ReactSortable
          list={images}
          className="flex flex-wrap gap-3"
          setList={updateImagesOrder}>
          {!!images?.length && images.map((link, index) => (
            <div key={link} className="relative h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200">
              <img src={link} alt="" className="rounded-lg" />
              <button
                type="button"
                onClick={() => deleteImage(index)}
                className="absolute top-1 right-1 text-red-500">
                X
              </button>
            </div>
          ))}
        </ReactSortable>
        {isUploading && (
          <div className="h-24 flex items-center">
            <Spinner />
          </div>
        )}
        <label className="w-24 h-24 cursor-pointer text-center flex flex-col items-center justify-center text-sm gap-1 text-primary rounded-sm bg-white shadow-sm border border-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <div>
            Add image
          </div>
          <input type="file" onChange={uploadImages} className="hidden" multiple />
        </label>
      </div>

      <label>Description</label>
      <textarea
        placeholder="Description"
        value={description}
        onChange={ev => setDescription(ev.target.value)}
        style={{ height: '200px' }} // Adjust the height as needed
      />



    <div>
      <label>Price (in PKR)</label>
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={ev => setPrice(ev.target.value)}
      />
      <label>Dicounted Percentage</label>
      <input
        type="number"
        placeholder="% Discount"
        value={discounted_percentage}
        onChange={ev => setdiscounted_percentage(ev.target.value)}
      />
      </div>


      <button
        type="submit"
        className="btn-primary">
        Save
      </button>
    </form>
  );
}
