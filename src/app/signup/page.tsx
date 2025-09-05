import HeaderInfo from "@/app/test/HeaderInfo";
import QuestionArea from "@/app/test/QuestionArea";
import AnswerArea from "@/app/test/AnswerArea";
import CorrectionCard from "@/app/test/CorrectionCard";
import ProgressSidebar from "@/app/test/ProgressSidebar";
import FooterControls from "@/app/test/FooterControls";

export default function TestPage() {
  return (
    <div className="flex flex-col h-screen bg-[#18132a] text-white">
      {/* 頂部資訊 */}
      <HeaderInfo />

      {/* 主體區域 */}
      <div className="flex flex-1">
        <div className="flex-1 p-4">
          <QuestionArea />
          <AnswerArea />
          <CorrectionCard /> {/* 答題後才顯示 */}
        </div>
        <ProgressSidebar />
      </div>

      {/* 底部控制 */}
      <FooterControls />
    </div>
  );
}
