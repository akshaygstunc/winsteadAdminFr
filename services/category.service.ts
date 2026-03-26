let categories = ["Apartment", "Villa"];

export const getCategories = async () => {
  return categories;
};

export const addCategory = async (name: string) => {
  categories.push(name);
  return categories;
};

export const deleteCategory = async (name: string) => {
  categories = categories.filter((c) => c !== name);
  return categories;
};