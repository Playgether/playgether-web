export const ConquistText = ({
  text,
  title,
  Icon,
  date,
}: {
  text: string;
  title: string;
  Icon?: React.ReactNode;
  date: string;
}) => {
  return (
    <div className="w-full flex h-fit">
      <div className="relative h-full">
        <div className="Conquists-circle h-4 w-4 rounded-full z-50 mt-2 -ml-2 absolute"></div>
      </div>

      <div className="w-full pl-4 space-y-2">
        <p className="text-xl font-semibold">{title}</p>
        <p className="font-thin bg-opacity-20 flex justify-start items-center w-1/6 Conquists-date">
          {date}
        </p>
        <div className="flex justify-between">
          <div className="relative font-thin Conquists-text text-md whitespace-pre-wrap">
            <p>{text}</p>
          </div>
        </div>
      </div>
      {Icon ? <div className="pr-4">{Icon}</div> : null}
    </div>
  );
};
