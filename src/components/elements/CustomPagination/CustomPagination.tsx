export const CustomPagination = ({ file_type }: { file_type: string }) => {
  return (
    <div
      className={`p-4 absolute min-w-[49px] min-h-[22px] w-full flex justify-center ${
        file_type === "image" ? "-bottom-5" : "-bottom-6"
      }`}
    >
      <div className="swiper-custom-pagination  mb-2 max-h-8 rounded px-3 min-w-[49px] min-h-[22px] max-w-[59px] mt-6 " />
    </div>
  );
};
