let locations = ["Dubai", "Abu Dhabi"];

export const getLocations = async () => {
  return locations;
};

export const addLocation = async (name: string) => {
  locations.push(name);
  return locations;
};

export const deleteLocation = async (name: string) => {
  locations = locations.filter((l) => l !== name);
  return locations;
};