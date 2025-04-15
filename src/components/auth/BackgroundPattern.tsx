
export function BackgroundPattern() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-femme-purple opacity-10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-femme-purple opacity-10 rounded-full blur-3xl"></div>
      
      <div className="absolute top-10 left-10 w-4 h-4 bg-femme-purple opacity-20 rounded-full"></div>
      <div className="absolute top-[20%] right-[15%] w-6 h-6 bg-femme-purple opacity-20 rounded-full"></div>
      <div className="absolute bottom-[25%] left-[10%] w-5 h-5 bg-femme-purple opacity-20 rounded-full"></div>
      <div className="absolute bottom-[15%] right-[20%] w-3 h-3 bg-femme-purple opacity-20 rounded-full"></div>
    </div>
  );
}
