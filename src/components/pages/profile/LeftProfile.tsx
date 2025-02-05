import Image from "next/legacy/image";
import DefaultButton from "../../elements/DefaultButton/DefaultButton";
import { MdVerified } from "react-icons/md";

export const LeftProfile = () => {
  return (
    <div className="aspect-[3/4] w-2/6 max-h-[calc(100vh-160px)] h-full lg:h-auto rounded-lg top-[4.6rem] sticky">
      <div className=" rounded-lg w-full h-full items-center">
        <div>
          <Image
            src={"/profile/profile1.jpg"}
            layout="fill"
            objectFit="cover"
            width={0}
            height={0}
            alt={"logo com o nome"}
            className="rounded-lg"
          />
        </div>
        <div className="absolute h-full w-full flex flex-col items-center justify-end py-5 px-4">
          <div className="w-full LeftProfile-card aspect-[16:9] rounded-3xl pb-4">
            <div className="relative h-20 w-20 -mt-11 ml-4">
              <Image
                src={"/profile/perfil.jpg"}
                layout="fill"
                objectFit="cover"
                width={0}
                height={0}
                alt={"logo com o nome"}
                className="rounded-full"
              />
            </div>
            <div className="-mt-5 px-20 absolute">
              <MdVerified className="LeftProfile-verified" />
            </div>
            <div className="flex justify-between">
              <div className="ml-4 pt-2 font-medium 2xl:text-lg flex items-center">
                <p>Neel Litorya</p>
              </div>
              <div className="flex justify-center items-center LeftProfile-status rounded-full h-10 w-10 2xl:w-14 2xl:h-14">
                <p className="2xl:text-2xl text-lg font-bold">4.6</p>
              </div>
              <div className="pr-4 relative rounded-xl flex items-center">
                <div className="shadow-md rounded-xl LeftProfile-shadow">
                  <DefaultButton className="2xl:px-5 2xl:py-1 px-3 py-1 rounded font-light">
                    Seguir
                  </DefaultButton>
                </div>
              </div>
            </div>
            <div className="flex justify-between h-4/6 lg:pb-6">
              <div className="flex flex-col justify-center items-center ml-4 2xl:ml-10">
                <p className="text-sm 2xl:text-lg font-normal 2xl:font-normal">
                  Seguidores
                </p>
                <p className="2xl:text-lg text-sm font-light">1150</p>
              </div>

              <div className="flex flex-col justify-center items-center">
                <p className="text-sm 2xl:text-lg font-normal 2xl:font-normal">
                  Curtidas
                </p>
                <p className="2xl:text-lg text-sm font-light">500</p>
              </div>

              <div className="flex flex-col justify-center items-center mr-4 2xl:mr-10">
                <p className="text-sm 2xl:text-lg  font-normal 2xl:font-normal">
                  Comentários
                </p>
                <p className="2xl:text-lg text-sm font-light">253</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
