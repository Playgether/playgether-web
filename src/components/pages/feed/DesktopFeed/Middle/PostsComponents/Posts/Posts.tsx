import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { twJoin} from 'tailwind-merge';
import { HTMLAttributes, Suspense, useEffect, useRef} from 'react';
import { PostMedias } from '../../../../../../../services/getFeed';
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { CustomPagination } from '../../../../../../elements/CustomPagination/CustomPagination';
import { VideoLoadingFallback } from './VideoLoadingFallBack';
import { CldImage, CldVideoPlayer } from 'next-cloudinary';
import 'next-cloudinary/dist/cld-video-player.css';



export interface PostsProps extends HTMLAttributes<HTMLDivElement>{
    /** Esta prop recebe uma lista de objetos do tipo (PostMedias) localizado no service getFeed, em resumo, uma lista de arquivos de medias de algum post. */
    media: PostMedias[], 
    /** Esta prop opcional recebe uma função que vai ser executada quando alguma media deste componente for clicada, essa função pode ser qualquer coisa, baseado no que você quer que aconteça. No caso
     * da página de feed, a função passada esta sendo utilizado para expandir o post acionando o componente "PostsExtend". Isto acontece através da função (handlePostsExtend)
     * localizada no compoenente "FeedComponent". Esta função muda o estado de duas constantes, fazendo com que PostsExtend apareça.)
      */
    onClick? : (...props: any[]) => void, 
    /** Esta é uma prop opcional que recebe uma função "set" de alguma constante executando-a setando o número index da media clicada (número da posição da media no slide), 
     * através disso, você pode controlar a constante de um componente fora deste para pegar o index do slide.
     * A ideia é utilizá-la no onClick, e então, quando o usuário clica em alguma media, ele pega o index que foi clicado e passa para a constante referente ao set passado.
     * No caso da página feed, o componente "FeedComponent" passa a função "setSlideIndex" para esta prop no onClick de alguma media em algum post, através disto, o mesmo componente 
     * consegue saber em qual index o slide foi clicado (posição da fila de medias) e executar o componente "PostsExtend" para abrir o slide exatamente neste 
     * index (abrir exatamente a mesma media que foi clicada) passando o número da constante "slideIndex" para o componente "PostsExtend"
     */
    setSlideIndex?: (slideIndex: number) => void
    /** Esta prop recebe um numero que representa o index que você quer começar o slide, ou seja, você pode começar o slide em uma posição específica, no caso da página feed, 
     * como dito anteriormente, o componente PostsExtend recebe a número do index clicado através do componente "FeedComponent" que também utiliza este componente, e através disto
     * ele também aciona este componente passando o número do index recebido do componente "FeedComponent" que por sua vez, recebe este número no onClick de alguma media 
     * em algum post através da prop setSlideIndex.
     */
    slideIndex?:number 
    
    /** Essa prop recebe a altura do post em valor numérico(px). Ela é necessária para criar uma altura exata para o container do post, caso nenhuma seja,
     * passada, o padrão será 720
     */
    postHeight?:number

    /** Essa prop recebe a largura do post em valor númerico(px). Ela é necessária para criar uma largura exata para o container do post, caso nenhuma seja,
     * passada, o padrão será 1080
     */
    postWidth?:number
}

/** Este componente é responsável por criar o carrousel (slide) dos posts que possuem media, sejam eles imagens, vídeos, ou os dois juntos. Você pode passar um className para
 * este componente para definir o tamanho do container do carrousel
 * OBS: Ele pode receber um "className" para serem definidas algumas personalizações como por exemplo: altura, largura, etc.
*/
const Posts = ({ media, slideIndex=0, onClick, setSlideIndex, postHeight=720, postWidth=1080, ...rest }: PostsProps) => {
    const volumeRef = useRef<HTMLVideoElement | null> (null)

    const handleSlideChange = (swiper) => {
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
            }
        });
        if (setSlideIndex) {
            setSlideIndex(swiper.snapIndex)
        }
    };


    useEffect (() => {

        const currentRef = volumeRef.current;

        if (currentRef) {
            currentRef.volume = 0.2;
        }   

    }, [volumeRef])


    return (
        <div className={twJoin("relative", rest.className)}>
            {media && media.length > 0 ? (
            <Swiper
            slidesPerView={1}
            pagination={{type:'fraction', el:'.swiper-custom-pagination',}}
            navigation
            style={{ height: `${postHeight}px` }}
            modules={[Navigation, Pagination]}
            className='h-full relative flex justify-center items-center'
            onSlideChange={handleSlideChange}
            initialSlide={slideIndex}
            noSwiping={true}
            // autoHeight={true}
            noSwipingClass="swiper-no-swiping"
            >
                <CustomPagination/>
                {media.map((item)=> (
                    <SwiperSlide key={item.id} style={{ maxHeight: `${postHeight}px`, height:`${postHeight}px` }} className='rounded'>
                        {item.media_type === "image" ? (
                            <div className='rounded h-full flex items-center justify-center'>
                                <CldImage
                                    src={item.media_file}
                                    width={postWidth}
                                    height={postHeight}
                                    style={{ maxHeight: `${postHeight}px` }}
                                    className="rounded object-contain"
                                    // sizes="(max-width: 768px) 100vw,
                                    // (max-width: 1200px) 50vw,
                                    // 33vw"
                                    alt="No information available"
                                    loading='lazy'
                                    onClick={onClick} 
                                />
                            </div>
                        ) : (
                            <div className='rounded items-center justify-center swiper-no-swiping flex'>
                                <Suspense fallback={<VideoLoadingFallback/>}>
                                <CldVideoPlayer
                                    width={postWidth}
                                    height={postHeight}
                                    src={item.media_file}
                                    autoPlay="on-scroll" 
                                    colors={{accent:"orange", text:"orange"}} 
                                    // playbackRates={["0.25", "0.5", "0.75", "1", "1.25", "1.50", "1.75", "2"]} 
                                    showJumpControls={true}
                                    seekThumbnails={false}
                                    logo={false}
                                    autoplay="on-screen"
                                    playsinline={true}
                                    fluid={true}
                                    className={`rounded object-contain max-h-[${postHeight}px] max-w-[${postWidth}px]`}
                                />
                                </Suspense>
                            </div>    
                        )
                    
                    }
                    </SwiperSlide>
                ))}
            </Swiper>
        ) : null}
                
        </div>
    );
};

export default Posts;
