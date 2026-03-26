export const getProjects = async () => {
  return [
    { id: 1, title: "Aurelia Heights", location: "Dubai" },
    { id: 2, title: "Skyline Tower", location: "Dubai" },
  ];
};

export const createProject = async (data: any) => {
  console.log("Creating project:", data);
  return { success: true };
};