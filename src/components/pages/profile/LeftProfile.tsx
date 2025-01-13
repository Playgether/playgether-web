import Image from "next/legacy/image";
import DefaultButton from "../../elements/DefaultButton/DefaultButton";
import { MdVerified } from "react-icons/md";

export const LeftProfile = () => {
  return (
    <div className=" max-h-full h-full w-3/6 rounded-lg">
      <div className="relative w-full max-h-full h-full rounded-lg">
        <div className="">
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
          <div className="w-full bg-white-400 h-2/6 rounded-3xl">
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
              <MdVerified className="text-blue-500" />
            </div>
            <div className="flex justify-between">
              <div className="text-black-300 ml-4 pt-2 font-medium text-lg">
                <p>Neel Litorya</p>
              </div>
              <div className="flex justify-center items-center text-green-400 -mt-6 rounded-full border border-green-400 w-14 h-14">
                <p className="text-2xl font-bold">4.6</p>
              </div>
              <div className="pr-4 -mt-4 relative rounded-xl">
                <div className="shadow-md rounded-xl shadow-gray-400">
                  <DefaultButton className="px-7 py-2 rounded-xl ">
                    Follow
                  </DefaultButton>
                </div>
              </div>
            </div>
            <div className="flex justify-between h-4/6 lg:pb-6">
              <div className="text-black-300 flex flex-col justify-center items-center ml-4 2xl:ml-16">
                <p>Followers</p>
                <p className="text-xl font-medium">1150</p>
              </div>

              <div className="text-black-300 flex flex-col justify-center items-center">
                <p>Likes</p>
                <p className="text-xl font-medium">500</p>
              </div>

              <div className="text-black-300 flex flex-col justify-center items-center mr-4 2xl:mr-16">
                <p>Comments</p>
                <p className="text-xl font-medium">253</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
