import '../app/globals.css'
import { useState } from "react";

export default function Profile(){
const Navbar = () => {
  const [isOpen, setOpen] = useState(false);
  const toggleMenu = () => setOpen(!isOpen);

  return (
    <div className="w-[1440px] h-[1337px] relative bg-neutral-100">
    <div className="w-[1440px] h-[74px] left-0 top-0 absolute">
      <div className="w-[1440px] h-[74px] left-0 top-0 absolute bg-sky-200"></div>
      <img className="w-[164px] h-14 left-[41px] top-[8px] absolute" src="https://via.placeholder.com/164x56" />
      <div className="w-[530px] h-[50.22px] left-[306px] top-[12px] absolute">
        <div className="w-[329.12px] h-[22.42px] left-[100.44px] top-[14.35px] absolute text-neutral-500 text-[20px] font-normal">Pesquisar</div>
        <div className="w-[33.18px] h-[33.18px] left-[45.74px] top-[8.97px] absolute"></div>
      </div>
      <div className="w-[546px] h-[48.55px] left-[858px] top-[12px] absolute">
        <div className="w-[36.10px] h-[36.10px] left-[509.90px] top-[7px] absolute">
          <div className="w-[27.08px] h-[27.08px] left-[4.51px] top-[4.51px] absolute">
          </div>
        </div>
        <div className="w-[36.10px] h-[36.10px] left-[448.42px] top-[7.98px] absolute"></div>
        <div className="w-[36.10px] h-[36.10px] left-[385px] top-0 absolute"></div>
        <div className="w-[36.10px] h-[36.10px] left-[317px] top-[8px] absolute"></div>
        <div className="w-[36.10px] h-[36.10px] left-0 top-[8px] absolute"></div>
        <div className="w-[38px] h-10 left-[243px] top-[5px] absolute">
          <div className="h-[27.14px] left-[1.58px] top-[6.43px] absolute">
          </div>
        </div>
      </div>
    </div>
    <div className="w-[1448px] h-[115px] left-0 top-[74px] absolute">
      <div className="w-[1440px] h-[11.31px] left-0 top-0 absolute bg-neutral-100"></div>
      <div className="w-[1440px] h-[102.35px] left-0 top-[4.65px] absolute bg-neutral-100"></div>
      <div className="w-44 h-[36.10px] left-[1272px] top-[29px] absolute">
        <div className="w-[134px] h-[27px] left-[42px] top-[7px] absolute"><span className="text-green-500 text-[20px] font-normal">578.489.56</span><span className="text-black text-[20px] font-normal"> </span></div>
        <div className="w-[36.10px] h-[36.10px] left-0 top-0 absolute"></div>
      </div>
      <div className="w-[140px] h-[17.68px] left-[65px] top-[42px] absolute text-sky-500 text-[20px] font-medium">GLOBAL CHAT</div>
      <div className="w-[177px] h-[3.39px] left-[322px] top-[43.73px] absolute text-sky-500 text-[15px] font-medium">Flávio Alessandro:</div>
      <div className="w-[36.10px] h-[33.59px] left-[236px] top-[42.80px] absolute"></div>
      <div className="w-6 h-[2.70px] left-[736px] top-[67.47px] absolute"></div>
      <div className="w-[696px] h-[17px] left-[456px] top-[44px] absolute text-zinc-800 text-[15px] font-medium">s jungler minimo ouro para o próximo Rei do lol. Entre em contato comigo para mais informações<br/></div>
      <div className="w-[1440px] h-[0px] left-0 top-[115px] absolute border border-zinc-400"></div>
    </div>
    <div className="w-[83px] h-[1127px] left-[22px] top-[197px] absolute">
      <div className="w-[83px] h-[1127px] left-0 top-0 absolute bg-orange-400 rounded-lg shadow"></div>
      <div className="w-[46.10px] h-[46.10px] left-[23px] top-[187.60px] absolute"></div>
      <div className="w-[46.10px] h-[46.10px] left-[20px] top-[494px] absolute"></div>
      <div className="w-[82px] h-[74.49px] left-[1px] top-[45.52px] absolute">
        <div className="w-[82px] h-[74.49px] left-0 top-0 absolute bg-orange-400"></div>
        <div className="w-[46.10px] h-[46.10px] left-[17px] top-[10.48px] absolute"></div>
      </div>
      <div className="w-[46.10px] h-[46.10px] left-[18px] top-[810px] absolute">
        <div className="h-[38.42px] left-[3.84px] top-[3.84px] absolute">
        </div>
      </div>
      <div className="w-[46.10px] h-[46.10px] left-[18px] top-[652px] absolute"></div>
      <div className="w-[46.10px] h-[46.10px] left-[20px] top-[946px] absolute"></div>
    </div>
    <div className="w-[255px] h-[410px] left-[129px] top-[197px] absolute">
      <div className="w-[255px] h-[410px] left-0 top-0 absolute bg-white"></div>
      <img className="w-32 h-32 left-[63px] top-[14px] absolute rounded-full" src="https://via.placeholder.com/128x128" />
      <div className="w-[135px] left-[63px] top-[154px] absolute text-black text-[20px] font-normal">Henry James</div>
      <div className="left-[68px] top-[187px] absolute text-black text-[15px] font-thin">@henryjames13</div>
      <div className="w-[219px] left-[24px] top-[219px] absolute text-black text-[15px] font-thin">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</div>
      <div className="w-[29px] h-[29px] left-[39px] top-[294px] absolute"></div>
      <div className="w-[29px] h-[29px] left-[108px] top-[294px] absolute"></div>
      <div className="w-[29px] h-[29px] left-[177px] top-[294px] absolute"></div>
      <div className="w-[121px] h-[51.26px] left-[63px] top-[341.57px] absolute">
        <div className="w-[121px] h-[51.26px] left-0 top-0 absolute bg-orange-400 rounded-lg"></div>
        <div className="w-[51.86px] h-[14.31px] left-[34px] top-[18.43px] absolute text-white text-[11px] font-extrabold">Ver Perfil</div>
      </div>
      <div className="w-6 h-6 left-[219px] top-[9px] absolute">
        <div className="w-[20.12px] h-[20.12px] left-[2px] top-[1.88px] absolute">
        </div>
      </div>
    </div>
    <div className="w-[275px] h-[741px] left-[119px] top-[316px] absolute">
      <div className="w-[255px] h-[410px] left-[10px] top-[331px] absolute bg-white"></div>
      <div className="w-[180px] h-[27px] left-[47px] top-[701px] absolute text-center text-neutral-400 text-[20px] font-medium">Ver todos</div>
      <div className="w-24 h-[691px] left-[91px] top-0 absolute">
        <div className="w-4 h-4 left-[80px] top-0 absolute bg-green-500 rounded-full"></div>
        <div className="w-4 h-4 left-0 top-[497px] absolute bg-green-500 rounded-full"></div>
        <div className="w-4 h-4 left-0 top-[614px] absolute bg-yellow-400 rounded-full"></div>
        <div className="w-4 h-4 left-0 top-[675px] absolute bg-green-500 rounded-full"></div>
        <div className="w-4 h-4 left-0 top-[558px] absolute bg-green-500 rounded-full"></div>
      </div>
      <div className="w-[152px] h-[42px] left-[61px] top-[588px] absolute">
        <img className="w-[42px] h-[42px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/42x42" />
        <div className="w-[106px] h-[21px] left-[46px] top-[11px] absolute text-center text-orange-400 text-[18px] font-semibold">Christopher </div>
      </div>
      <div className="w-[152px] h-[42px] left-[61px] top-[645px] absolute">
        <img className="w-[42px] h-[42px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/42x42" />
        <div className="w-[106px] h-[21px] left-[46px] top-[11px] absolute text-center text-orange-400 text-[18px] font-semibold">Sophia</div>
      </div>
      <div className="w-[152px] h-[42px] left-[61px] top-[531px] absolute">
        <img className="w-[42px] h-[42px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/42x42" />
        <div className="w-[106px] h-[21px] left-[46px] top-[11px] absolute text-center text-orange-400 text-[18px] font-semibold">Oliver Liam</div>
      </div>
      <div className="w-[152px] h-[42px] left-[61px] top-[468px] absolute">
        <img className="w-[42px] h-[42px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/42x42" />
        <div className="w-[106px] h-[21px] left-[46px] top-[11px] absolute text-center"><span className="text-orange-400 text-[18px] font-semibold">Mia Jensen</span><span className="text-black text-[18px] font-semibold"> </span></div>
      </div>
      <div className="w-[198px] h-[27px] left-[49px] top-[417px] absolute">
        <div className="w-36 h-[22px] left-[54px] top-0 absolute text-neutral-500 text-[20px] font-normal">Pesquisar</div>
        <div className="w-[20.18px] h-[20.18px] left-[4px] top-[2px] absolute"></div>
        <div className="w-[180px] h-[0px] left-0 top-[27px] absolute border border-neutral-300"></div>
      </div>
      <div className="w-[275px] h-[34px] left-0 top-[353px] absolute">
        <div className="w-[275px] h-[21px] left-0 top-0 absolute text-center text-zinc-600 text-[20px] font-medium">Amigos Online</div>
        <div className="w-[197px] h-[0px] left-[41px] top-[34px] absolute border border-neutral-300"></div>
      </div>
    </div>
    <div className="w-[283px] h-[61.43px] left-[625px] top-[1252px] absolute">
      <div className="w-[283px] h-[61.43px] left-0 top-0 absolute bg-orange-400 bg-opacity-0 rounded-lg"></div>
      <div className="w-[283px] h-7 left-0 top-[17.08px] absolute text-center text-orange-400 text-[25px] font-extrabold">Carregar Mais</div>
    </div>
    <div className="w-[279px] h-[410px] left-[1148px] top-[647px] absolute">
      <div className="w-[275px] h-[410px] left-[4px] top-0 absolute bg-white shadow border border border border"></div>
      <div className="w-[216px] left-[30px] top-[257px] absolute"><span className="text-sky-500 text-[15px] font-extrabold">Eventos:</span><span className="text-orange-400 text-[15px] font-extrabold"> </span><span className="text-orange-400 text-[15px] font-semibold">Rei do LoL.</span></div>
      <div className="w-[216px] left-[32px] top-[299px] absolute"><span className="text-sky-500 text-[15px] font-extrabold">Competições:</span><span className="text-orange-400 text-[15px] font-extrabold"> </span><span className="text-orange-400 text-[15px] font-semibold">Quinto campeonato de dispu</span></div>
      <div className="w-[216px] left-[30px] top-[215px] absolute"><span className="text-sky-500 text-[15px] font-extrabold">Ranking:</span><span className="text-orange-400 text-[15px] font-extrabold"> </span><span className="text-orange-400 text-[15px] font-semibold">Top 1 Jett Valorant.</span></div>
      <div className="w-[216px] left-[30px] top-[155px] absolute"><span className="text-sky-500 text-[15px] font-extrabold">Noticia:</span><span className="text-orange-400 text-[15px] font-extrabold"> </span><span className="text-orange-400 text-[15px] font-semibold">Ato 7 do Valorant, veja tudo de novo aqui.</span></div>
      <div className="w-[180px] h-[27px] left-[59px] top-[370px] absolute text-center text-neutral-400 text-[20px] font-medium">Ver todos</div>
      <div className="w-[216px] left-[30px] top-[113px] absolute"><span className="text-sky-500 text-[15px] font-extrabold">Thread:</span><span className="text-orange-400 text-[15px] font-extrabold"> </span><span className="text-orange-400 text-[15px] font-semibold">O lol está acabando</span></div>
      <div className="w-[275px] h-[34px] left-0 top-[22px] absolute">
        <div className="w-[275px] h-[21px] left-0 top-0 absolute text-center text-zinc-600 text-[20px] font-medium">Assuntos do Momento</div>
        <div className="w-[197px] h-[0px] left-[41px] top-[34px] absolute border border-neutral-300"></div>
      </div>
      <div className="w-[216px] left-[30px] top-[71px] absolute"><span className="text-sky-500 text-[15px] font-black">Assunto:</span><span className="text-orange-400 text-[15px] font-black"> </span><span className="text-orange-400 text-[15px] font-semibold">Counter Strike 2</span></div>
      <div className="w-6 h-6 left-[195px] top-[317px] absolute"></div>
    </div>
    <div className="w-[739px] h-[269px] left-[399px] top-[197px] absolute">
      <div className="w-[739px] h-[269px] left-0 top-0 absolute bg-white rounded-lg"></div>
      <div className="w-[627px] h-[0px] left-[54px] top-[46px] absolute border border-neutral-300"></div>
      <div className="w-16 h-[21px] left-[336px] top-[12px] absolute text-zinc-600 text-[20px] font-medium">Postar<br/></div>
      <img className="w-[73px] h-[73px] left-[54px] top-[83px] absolute rounded-full" src="https://via.placeholder.com/73x73" />
      <div className="w-[266px] h-[27px] left-[151px] top-[109px] absolute text-neutral-400 text-[20px] font-medium">Compartilhe algo conosoco</div>
      <div className="w-[627px] h-[33px] left-[54px] top-[203px] absolute bg-orange-400 rounded-lg"></div>
      <div className="w-[130px] h-[23px] left-[304px] top-[208px] absolute text-white text-[18px] font-extrabold">Compartilhar</div>
    </div>
    <div className="w-[740px] h-[743px] left-[399px] top-[482px] absolute">
      <div className="w-[740px] h-[743px] left-0 top-0 absolute bg-white rounded-lg shadow"></div>
      <img className="w-[73px] h-[73px] left-[28px] top-[22px] absolute rounded-full" src="https://via.placeholder.com/73x73" />
      <div className="left-[127px] top-[32px] absolute text-orange-400 text-[20px] font-medium">Mia Jensen</div>
      <div className="w-[92px] h-5 left-[127px] top-[62px] absolute text-neutral-400 text-[15px] font-medium">2 hours ago</div>
      <img className="w-[706px] h-[447px] left-[17px] top-[184px] absolute" src="https://via.placeholder.com/706x447" />
      <div className="w-[671px] h-[51px] left-[36px] top-[114px] absolute text-black text-[20px] font-thin">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</div>
      <div className="left-[658px] top-[686px] absolute text-zinc-800 text-[20px] font-medium">342</div>
      <div className="w-[706px] h-[689px] left-[17px] top-[23px] absolute">
        <div className="left-[73px] top-[663px] absolute text-zinc-800 text-[20px] font-medium">1.2k</div>
        <div className="left-[355px] top-[661px] absolute text-zinc-800 text-[20px] font-medium">342</div>
        <div className="w-[706px] h-[0px] left-0 top-[630px] absolute border border-zinc-400"></div>
        <div className="w-8 h-8 left-[312px] top-[657px] absolute"></div>
        <div className="w-8 h-8 left-[31px] top-[657px] absolute"></div>
        <div className="w-8 h-8 left-[593px] top-[657px] absolute"></div>
        <div className="w-[52px] h-[52px] left-[641px] top-0 absolute"></div>
      </div>
    </div>
    <div className="w-[275px] h-[410px] left-[1152px] top-[197px] absolute">
      <div className="w-[275px] h-[410px] left-0 top-0 absolute bg-white shadow border border border border"></div>
      <div className="w-[249px] h-[37px] left-[13px] top-[238px] absolute">
        <img className="w-[37px] h-[37px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/37x37" />
        <div className="w-[201px] h-[25px] left-[48px] top-[8px] absolute text-center"><span className="text-orange-400 text-[15px] font-semibold">Oliver Liam</span><span className="text-black text-[15px] font-semibold"> entrou para o mesmo clã que você</span></div>
      </div>
      <div className="w-[249px] h-[37px] left-[13px] top-[316px] absolute">
        <img className="w-[37px] h-[37px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/37x37" />
        <div className="w-[201px] h-[25px] left-[48px] top-[8px] absolute text-center"><span className="text-orange-400 text-[15px] font-semibold">David Matthew</span><span className="text-black text-[15px] font-semibold"> seguiu você</span></div>
      </div>
      <div className="w-[249px] h-[37px] left-[14px] top-[160px] absolute">
        <img className="w-[37px] h-[37px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/37x37" />
        <div className="w-[201px] h-[25px] left-[48px] top-[8px] absolute text-center"><span className="text-orange-400 text-[15px] font-semibold">Mia Jensen</span><span className="text-black text-[15px] font-semibold"> comentou sua foto .</span></div>
      </div>
      <div className="w-[275px] h-[34px] left-0 top-[22px] absolute">
        <div className="w-[275px] h-[21px] left-0 top-0 absolute text-center text-zinc-600 text-[20px] font-medium">Notificações Recentes</div>
        <div className="w-[197px] h-[0px] left-[41px] top-[34px] absolute border border-neutral-300"></div>
      </div>
      <div className="w-[249px] h-[37px] left-[14px] top-[82px] absolute">
        <img className="w-[37px] h-[37px] left-0 top-0 absolute rounded-full" src="https://via.placeholder.com/37x37" />
        <div className="w-[201px] h-[25px] left-[48px] top-[8px] absolute text-center"><span className="text-orange-400 text-[15px] font-semibold">Mia Jensen</span><span className="text-black text-[15px] font-semibold"> curtiu sua foto.</span></div>
      </div>
      <div className="w-[180px] h-[27px] left-[55px] top-[372px] absolute text-center text-neutral-400 text-[20px] font-medium">Ver todas</div>
    </div>
  </div>
  );
};
}
