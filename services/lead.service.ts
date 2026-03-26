let leads = [
  {
    id: 1,
    name: "John Doe",
    email: "john@mail.com",
    phone: "123456",
    message: "Interested in villa",
    property: "Aurelia Heights",
    status: "new",
  },
];

export const getLeads = async () => {
  return leads;
};

export const updateLeadStatus = async (id: number, status: string) => {
  leads = leads.map((l) =>
    l.id === id ? { ...l, status } : l
  );
  return leads;
};