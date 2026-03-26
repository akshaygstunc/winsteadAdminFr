export type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  property: string;
  status: "new" | "contacted" | "closed";
};