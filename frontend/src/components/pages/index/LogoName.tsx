import Image from 'next/image'

const LogoName = () => {
    return(
        <Image
            src={"/index/name.png"}
            width={0}
            height={0}
            alt="Picture of the author"
            layout='responsive'
        />
    );
};

export default LogoName;

