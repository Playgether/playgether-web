import { BrandLogo } from "@/components/general/BrandLogo";

const LogoName = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <BrandLogo
        variant="vertical"
        className="h-auto w-[min(90vw,22rem)] md:w-[min(90vw,28rem)]"
        priority
      />
    </div>
  );
};

export default LogoName;
