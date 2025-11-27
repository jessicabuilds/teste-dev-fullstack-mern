const categoryImages = {
  notebooks: '/images/categories/notebooks.jpg',
  smartphones: '/images/categories/smartphones.jpg',
  perifericos: '/images/categories/perifericos.jpg',
  hardware: '/images/categories/hardware.jpg',
  default: '/images/categories/default.jpg',
};

export const getCategoryImage = (category) => {
  if (!category) return categoryImages.default;
  
  const normalizedCategory = category.toLowerCase().trim();
  return categoryImages[normalizedCategory] || categoryImages.default;
};

export const getProductImage = (product) => {
  if (product?.imageUrl) {
    return product.imageUrl;
  }
  return getCategoryImage(product?.category);
};

export default {
  getCategoryImage,
  getProductImage,
};
