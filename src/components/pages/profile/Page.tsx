import React from "react";

const Page = ({ children }: { children: React.ReactNode }) => {
  const childrenArray = React.Children.toArray(children);
  const leftColumn = childrenArray[0];
  const rightColumn = childrenArray.slice(1);

  return (
    <div className="mb-[120px] pt-16 ml-0 md:ml-20">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 order-1 lg:order-1">
            <div className="sticky top-20">{leftColumn}</div>
          </div>

          <div className="lg:col-span-3 order-2 lg:order-2">{rightColumn}</div>
        </div>
      </div>
    </div>
  );
};

export default Page;
