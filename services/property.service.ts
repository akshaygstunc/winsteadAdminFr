const mock = [
  {
    id: 1,
    title: "Aurelia Heights",
    location: "Dubai",
    type: "Buy",
    category: "Villa",
    isFeatured: true,
  },
  {
    id: 2,
    title: "Skyline Tower",
    location: "Dubai",
    type: "Rent",
    category: "Apartment",
    isFeatured: false,
  },
];

export const getProperties = async (filters: any, page: number) => {
  let data = [...mock];

  if (filters.search) {
    data = data.filter((p) =>
      p.title.toLowerCase().includes(filters.search.toLowerCase())
    );
  }

  if (filters.type) {
    data = data.filter((p) => p.type === filters.type);
  }

  if (filters.location) {
    data = data.filter((p) => p.location === filters.location);
  }

  if (filters.category) {
    data = data.filter((p) => p.category === filters.category);
  }

  return data;
};