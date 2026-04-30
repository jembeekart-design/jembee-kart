export const Modal = ({ children }: any) => {
  return (
    <div style={{ position: "fixed", top: 100 }}>
      {children}
    </div>
  );
};