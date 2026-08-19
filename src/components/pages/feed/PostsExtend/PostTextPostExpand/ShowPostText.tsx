import { MentionText } from "@/components/mentions/MentionText";

function ShowPostText({ text }: { text: string }) {
  return (
    <div className="pt-4 pl-4 pb-4">
      <p>
        <MentionText text={text} />
      </p>
    </div>
  );
}

export default ShowPostText;
