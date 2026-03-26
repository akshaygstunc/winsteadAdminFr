// Input Component
export default function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return <input placeholder={placeholder} value={value} onChange={onChange} />;
}
