import Image from 'next/legacy/image'

const LogoName = () => {
    return(
        <Image
            src={"/index/name.png"}
            width={0}
            height={0}
            alt="Logo com nome"
            layout='fill'
            objectFit='contain'
        />
    );
};

export default LogoName;

