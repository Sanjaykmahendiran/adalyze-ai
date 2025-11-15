import React from "react";
import shareBg from "@/assets/share-ad-result-bg.jpg";

interface ShareAdResultFeedbackProps {
    adImage: string;
    feedback: string[];
    AdName: string;
    id?: string;
}

const ShareAdResultFeedback: React.FC<ShareAdResultFeedbackProps> = ({
    adImage,
    feedback,
    AdName,
    id = "ad-feedback-card",
}) => {
    return (
        <div
            id={id}
            className="w-[700px] h-[700px] bg-black relative flex flex-col items-center justify-start py-8">

            {/* Title Section */}
            <div className="text-center mb-8">
                <h2 className="text-5xl font-bold text-white">
                    {AdName}
                </h2>
            </div>

            {/* Ad Preview & Score Cards */}
            <div className="relative w-[350px] mb-8">
                {/* Main Ad with Orange Border */}
                <div
                    className="bg-[#171717] rounded-3xl overflow-hidden shadow-2xl border border-[#db4900]">
                    <img
                        src={adImage}
                        alt="Ad Preview"
                        className="w-full h-[350px] object-cover"
                    />
                </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-center justify-center px-8 bg-[#171717] rounded-3xl p-4">

                <ul className="text-white text-xl text-left" style={{ whiteSpace: 'pre-line' }}>
                    <h3 className="text-2xl font-bold text-white mb-2">Feedback</h3>
                    {feedback.map((item, index) => (
                        <li key={index} className="flex items-start text-gray-300">
                            <span className="mr-2 sm:mr-3 text-green-400 text-base sm:text-lg flex-shrink-0">•</span>
                            <span className="text-sm sm:text-base leading-relaxed">{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ShareAdResultFeedback;
