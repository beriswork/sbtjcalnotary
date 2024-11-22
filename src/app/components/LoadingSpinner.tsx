export const LoadingSpinner = () => (
  <div className="fixed inset-0 bg-[#f9fafb] flex items-center justify-center z-[9999]">
    <div className="relative w-16 h-16">
      <div className="animate-spin rounded-full h-16 w-16 border-[3px] border-solid border-[#0066ff] border-t-transparent"></div>
      <div className="absolute inset-0 rounded-full border-[3px] border-[#0066ff] opacity-20"></div>
    </div>
  </div>
); 