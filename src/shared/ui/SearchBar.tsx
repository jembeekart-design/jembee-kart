export const SearchBar = ({ onSearch }: any) => {
  return (
    <input
      placeholder="Search..."
      onChange={(e) => onSearch(e.target.value)}
      style={{ padding: 10, borderRadius: 10 }}
    />
  );
};