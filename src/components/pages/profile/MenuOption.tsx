const MenuOption = ({
  text,
  setContent,
  content,
}: {
  text: string;
  setContent: (content: string) => void;
  content: string;
}) => {
  const handleContent = (textContent: string) => {
    setContent(textContent);
  };
  return (
    <div
      className={`MenuProfile-option relative h-full flex flex-col items-center justify-center w-20 cursor-pointer transition-colors duration-400 ease-in-out 
        after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-[1px] after:transition-all after:duration-500 after:origin-center 
        ${content === text ? "MenuProfile-selected after:w-full after:scale-x-100 after:opacity-100" : "after:w-0 after:scale-x-0"} 
        hover:after:w-full hover:after:scale-x-100 hover:after:opacity-100 capitalize`}
      onClick={() => handleContent(text)}
    >
      <li>
        <a>{text}</a>
      </li>
    </div>
  );
};

export default MenuOption;
