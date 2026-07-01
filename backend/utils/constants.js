export const POST_CATEGORIES = {
  COSMETICS: "Cosmetics",
  CLOTHING: "Clothing",
  ACCESSORIES: "Accessories",
};

export const ALLOWED_CATEGORIES = [
  POST_CATEGORIES.COSMETICS,
  POST_CATEGORIES.CLOTHING,
  POST_CATEGORIES.ACCESSORIES,
];

export const getCategoryList = () => Object.values(POST_CATEGORIES);

export const isValidCategory = (category) => {
  return ALLOWED_CATEGORIES.includes(category);
};
