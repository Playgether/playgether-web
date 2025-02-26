import React from "react";
import { IoIosSearch } from "react-icons/io";
import { BiSolidImageAdd } from "react-icons/bi";
import { FaRegSmile } from "react-icons/fa";
import { MdCall, MdVideoCall, MdInfo } from "react-icons/md";
import { HiMicrophone } from "react-icons/hi";
import { IoSend, IoAttach } from "react-icons/io5";

const Chat = () => {
  return (
    <div className="flex h-full max-h-[calc(100vh-40px)] bg-[#462991] text-white">
      <div className="w-80 flex flex-col border-r border-[#5647b0] min-h-0">
        <div className="p-4 flex items-center justify-between border-b border-[#5647b0] bg-[#3d2380] flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-[#6b5bc4] rounded-full flex items-center justify-center">
              <span className="text-xl">👓</span>
            </div>
            <h1 className="text-lg font-semibold">Mensagens</h1>
          </div>
          <div className="bg-[#6b5bc4] h-8 w-8 rounded-full flex items-center justify-center">
            <span className="text-xl">✏️</span>
          </div>
        </div>

        <div className="p-3 bg-[#5647b0] flex-shrink-0">
          <div className="bg-[#3d2380] rounded-full flex items-center p-2">
            <IoIosSearch className="ml-1 text-gray-300" size={20} />
            <input
              type="text"
              placeholder="Pesquisar"
              className="bg-transparent border-none focus:outline-none w-full pl-2 text-sm"
            />
          </div>
        </div>

        <div className="px-4 py-2 bg-[#5647b0] flex-shrink-0">
          <div className="flex items-center space-x-4 py-2 overflow-x-auto">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-14 w-14 bg-[#3d2380] rounded-full flex items-center justify-center">
                  <span className="text-2xl">+</span>
                </div>
              </div>
              <span className="text-xs mt-1">Seu Story</span>
            </div>
            {["Anna", "Jeff", "Cathy"].map((name, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#e83c76]">
                    <img
                      src={`https://randomuser.me/api/portraits/${idx % 2 === 0 ? "women" : "men"}/${idx + 1}.jpg`}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#5647b0]"></div>
                </div>
                <span className="text-xs mt-1">{name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 bg-[#5647b0] min-h-0">
          {[
            {
              name: "Angelina Jolie",
              message: "Ok, vejo você no metrô...",
              time: "Agora",
              online: true,
            },
            {
              name: "Tony Stark",
              message: "Ei, você está aí?",
              time: "10min",
              online: true,
            },
            {
              name: "Scarlett Johansson",
              message: "Você enviou uma foto.",
              time: "1h",
              online: false,
              active: true,
            },
            {
              name: "John Snow",
              message: "Você perdeu uma chamada de John.",
              time: "4h",
              online: false,
            },
            {
              name: "Emma Watson",
              message: "Você enviou um vídeo.",
              time: "11 Fev",
              online: false,
            },
            {
              name: "Sunny Leone",
              message: "Ah, foi incrível...",
              time: "1 Fev",
              online: true,
            },
            {
              name: "Bruce Lee",
              message: "Você é um grande ser humano...",
              time: "23 Jan",
              online: false,
            },
            {
              name: "Grupo TailwindCSS",
              message: "Adam: Versão 2 é...",
              time: "23 Jan",
              isGroup: true,
            },
          ].map((chat, idx) => (
            <div
              key={idx}
              className={`flex items-center p-3 hover:bg-[#6b5bc4] cursor-pointer ${idx === 2 ? "bg-[#6b5bc4]" : ""}`}
            >
              <div className="relative mr-3">
                <img
                  src={`https://randomuser.me/api/portraits/${idx % 2 === 0 ? "women" : "men"}/${idx + 5}.jpg`}
                  alt={chat.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#5647b0]"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium truncate">{chat.name}</h3>
                  <span className="text-xs text-gray-300">{chat.time}</span>
                </div>
                <p className="text-sm text-gray-300 truncate">{chat.message}</p>
              </div>
              {idx === 2 && (
                <div className="h-2 w-2 bg-[#e83c76] rounded-full ml-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-[#462991] min-h-0">
        <div className="p-3 border-b border-[#5647b0] flex justify-between items-center bg-[#3d2380] flex-shrink-0">
          <div className="flex items-center">
            <div className="relative mr-3">
              <img
                src="https://randomuser.me/api/portraits/women/8.jpg"
                alt="Scarlett Johansson"
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-[#3d2380]"></div>
            </div>
            <div>
              <h2 className="font-medium">Scarlett Johansson</h2>
              <p className="text-xs text-gray-300">Ativa há 1h</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-gray-300">
            <MdCall size={20} className="cursor-pointer" />
            <MdVideoCall size={24} className="cursor-pointer" />
            <MdInfo size={20} className="cursor-pointer" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          <div className="flex items-end">
            <img
              src="https://randomuser.me/api/portraits/women/8.jpg"
              alt="Scarlett"
              className="h-8 w-8 rounded-full mr-2"
            />
            <div className="max-w-xs">
              <div className="bg-[#6b5bc4] p-3 rounded-2xl rounded-bl-none">
                <p>Ei! Como você está?</p>
              </div>
              <p className="text-xs text-gray-300 mt-1">11:30</p>
            </div>
          </div>

          <div className="flex items-end">
            <img
              src="https://randomuser.me/api/portraits/women/8.jpg"
              alt="Scarlett"
              className="h-8 w-8 rounded-full mr-2"
            />
            <div className="max-w-xs">
              <div className="bg-[#6b5bc4] p-3 rounded-2xl rounded-bl-none">
                <p>Vamos fazer trilha neste fim de semana?</p>
              </div>
              <p className="text-xs text-gray-300 mt-1">11:32</p>
            </div>
          </div>

          <div className="flex items-end">
            <img
              src="https://randomuser.me/api/portraits/women/8.jpg"
              alt="Scarlett"
              className="h-8 w-8 rounded-full mr-2"
            />
            <div className="max-w-xs">
              <div className="bg-[#6b5bc4] p-3 rounded-2xl rounded-bl-none">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Volutpat lacus laoreet non curabitur gravida.
                </p>
              </div>
              <p className="text-xs text-gray-300 mt-1">Sex 15:04</p>
            </div>
          </div>

          <div className="flex flex-row-reverse items-end">
            <div className="max-w-xs">
              <div className="bg-[#e83c76] p-3 rounded-2xl rounded-br-none">
                <p>Ei! Como você está?</p>
              </div>
              <p className="text-xs text-gray-300 mt-1 text-right">11:35</p>
            </div>
          </div>

          <div className="flex flex-row-reverse items-end">
            <div className="max-w-xs">
              <div className="bg-[#e83c76] p-3 rounded-2xl rounded-br-none">
                <p>Vamos fazer trilha neste fim de semana?</p>
              </div>
              <p className="text-xs text-gray-300 mt-1 text-right">11:36</p>
            </div>
          </div>

          <div className="flex flex-row-reverse items-end">
            <div className="max-w-xs">
              <div className="bg-[#e83c76] p-3 rounded-2xl rounded-br-none">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Volutpat lacus laoreet non curabitur gravida.
                </p>
              </div>
              <p className="text-xs text-gray-300 mt-1 text-right">Sáb 14:10</p>
            </div>
          </div>

    
          <div className="flex items-end">
            <img
              src="https://randomuser.me/api/portraits/women/8.jpg"
              alt="Scarlett"
              className="h-8 w-8 rounded-full mr-2"
            />
            <div className="max-w-xs">
              <div className="bg-[#6b5bc4] p-3 rounded-2xl rounded-bl-none">
                <p>Ei! Como você está?</p>
              </div>
              <p className="text-xs text-gray-300 mt-1">12:40</p>
            </div>
          </div>

          <div className="flex flex-row-reverse items-end">
            <div className="max-w-xs">
              <div className="bg-[#e83c76] p-3 rounded-2xl rounded-br-none">
                <p>Ei! Como você está?</p>
              </div>
              <p className="text-xs text-gray-300 mt-1 text-right">Agora</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-[#5647b0] flex items-center bg-[#3d2380] flex-shrink-0">
          <div className="flex gap-2 text-gray-300 mr-3">
            <button className="p-2 rounded-full hover:bg-[#6b5bc4]">
              <IoAttach size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-[#6b5bc4]">
              <BiSolidImageAdd size={20} />
            </button>
            <button className="p-2 rounded-full hover:bg-[#6b5bc4]">
              <HiMicrophone size={20} />
            </button>
          </div>
          <div className="flex-1 bg-[#6b5bc4] rounded-full flex items-center px-3 py-2">
            <input
              type="text"
              placeholder="Aa"
              className="bg-transparent border-none focus:outline-none w-full text-sm"
            />
            <FaRegSmile className="text-gray-300 ml-2" size={20} />
          </div>
          <button className="ml-3 p-2 text-[#e83c76]">
            <IoSend size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
