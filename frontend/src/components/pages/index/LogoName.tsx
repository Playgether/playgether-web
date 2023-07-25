import Image from 'next/legacy/image'

const LogoName = () => {
    return(
        <Image
            src={"/index/name.png"}
            width={0}
            height={0}
            alt="Picture of the author"
            layout='fill'
            objectFit='contain'
        />
    );
};

export default LogoName;

