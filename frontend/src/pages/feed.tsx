import '../app/globals.css'
import Button from '../components/elements/Button'
import ImageComponent from '../components/elements/ImageComponent';

export default function Feed() {
  const handleButtonClick = (buttonName) => {
    "certo";
  };
  return (
    <div>
        <p className="text-orange-500 ">The quick brown fox ...</p>
        <p className="text-orange-400 ">The quick brown fox ...</p>
        <p className="text-orange-300 ">The quick brown fox ...</p>
        <p className="text-blue-500 ">The quick brown fox ...</p>
        <p className="text-blue-400 ">The quick brown fox ...</p>
        <p className="text-blue-300 ">The quick brown fox ...</p>
        <p className="text-white-500 ">The quick brown fox ...</p>
        <p className="text-white-400 ">The quick brown fox ...</p>
        <p className="text-white-300 ">The quick brown fox ...</p>
        <p className="text-white-200 ">The quick brown fox ...</p>
        <p className="text-black-500 ">The quick brown fox ...</p>
        <p className="text-black-400 ">The quick brown fox ...</p>
        <p className="text-black-300 ">The quick brown fox ...</p>
        <p className="text-black-200 ">The quick brown fox ...</p>
        <Button
                onClick={null}
                pxValue={8}
                pyValue={4}
                extraClassName={'inline-block w-full leading-none shadow'}          
                >
                CADASTRAR
        </Button>
        <ImageComponent src={"/index/logo.png"} width={0} height={0} layout={'responsive'} alt={"test"}/>
    </div>
  )
}
