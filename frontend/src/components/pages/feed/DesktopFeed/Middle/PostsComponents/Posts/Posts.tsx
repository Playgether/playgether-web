import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import Image from "next/legacy/image";
import { twJoin, twMerge } from 'tailwind-merge';
import { HTMLAttributes, useEffect, useRef} from 'react';
import { PostMedias } from '../../../../../../../services/getFeed';


export interface PostsProps extends HTMLAttributes<HTMLDivElement>{
    /** Esta prop recebe uma lista de objetos do tipo (PostMedias) localizado no service getFeed, em resumo, uma lista de arquivos de medias de algum post. */
    media: PostMedias[], 
    /** Esta prop opcional recebe uma função que vai ser executada quando alguma media deste componente for clicada, essa função pode ser qualquer coisa, baseado no que você quer que aconteça. No caso
     * da página de feed, a função passada esta sendo utilizado para expandir o post acionando o componente "PostsExtend". Isto acontece através da função (handlePostsExtend)
     * localizada no compoenente "FeedComponent". Esta função muda o estado de duas constantes, fazendo com que PostsExtend apareça.)
      */
    onClick? : (...props: any[]) => void, 
    /** Esta prop define o tamanho das medias deste componente, ela pode receber um "h-full" ou um "h-1/2" caso você queira que as medias ocupem metade do espaço do container */
    postsSize?: string
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
}

/** Este componente é responsável por criar o carrousel (slide) dos posts que possuem media, sejam eles imagens, vídeos, ou os dois juntos. Você pode passar um className para
 * este componente para definir o tamanho do container do carrousel.
*/
const Posts = ({ media, slideIndex=0, onClick, setSlideIndex, postsSize="h-full", ...rest }: PostsProps) => {
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
        <>
        {media && media.length > 0 ? (
            <div className={twMerge("bg-white-200 items-center justify-center relative pt-3 cursor-pointer", rest.className)}>
            <Swiper 
                modules={[Navigation, Pagination, Scrollbar, A11y]}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true, el: '.sample-slider', }}
                className=" relative h-full z-10"
                onSlideChange={handleSlideChange}
                initialSlide={slideIndex}
                >
                {media.map(item => (
                    <SwiperSlide key={item.id} className=" h-full" onClick={
                        onClick
                    }>
          
                        {item.media_type === "image" ? (
                        <div className={twJoin("relative ", postsSize)} >
                            <Image
                                src={item.media_file}
                                alt={"TESTE"}
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                        ) : (
                        <div className={twJoin("relative", postsSize)} >
                            <video playsInline muted autoPlay controls ref={volumeRef} className="object-contain h-full mx-auto">
                                <source src={item.media_file} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="sample-slider swiper-pagination-bullets sample-slider-pagination"></div>
            </div>
        ) : null}
        </>
    );
};

export default Posts
