import React, { useState } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Star,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Review } from '../../types/reviewsAndRecommendations';

interface OperatorReplyModalProps {
  review: Review;
  onClose: () => void;
  onSubmitReply: (reviewId: string, reply: string) => void;
}

const REPLY_TEMPLATES = [
  'Thank you for your valuable feedback! We truly appreciate you taking the time to share your experience.',
  'We sincerely apologize for the inconvenience. We are actively working to improve this area.',
  'Thank you for visiting! We are delighted to hear you had a great experience and hope to see you again.',
  'We appreciate your honest review. Your feedback has been shared with our team for continuous improvement.',
];

export const OperatorReplyModal: React.FC<OperatorReplyModalProps> = ({
  review,
  onClose,
  onSubmitReply,
}) => {
  const [reply, setReply] = useState(review.operatorNotes || '');
  const [submitted, setSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(review.operatorNotes?.length || 0);
  const MAX_CHARS = 500;

  const handleTextChange = (val: string) => {
    if (val.length <= MAX_CHARS) {
      setReply(val);
      setCharCount(val.length);
    }
  };

  const handleSubmit = () => {
    if (!reply.trim()) return;
    onSubmitReply(review.id, reply.trim());
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-0 max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-[#0B3A53]/5 to-[#16A6A1]/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#16A6A1]/10 text-[#16A6A1]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0B3A53] font-heading">
                Operator Response
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Reply on behalf of Travel Link management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Original Review Preview */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={review.touristAvatar}
                  alt={review.touristName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <div className="text-xs font-extrabold text-slate-900">{review.touristName}</div>
                  <div className="text-[10px] text-slate-400 font-medium">{review.touristCountry} · {review.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                  />
                ))}
              </div>
            </div>
            <div className="text-xs font-black text-slate-900 mt-1">{review.title}</div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3">
              "{review.comment}"
            </p>
            <div className="text-[10px] text-[#16A6A1] font-black uppercase tracking-wide">
              📍 {review.targetName} · {review.targetType}
            </div>
          </div>

          {/* Quick Reply Templates */}
          <div>
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
              Quick Templates
            </p>
            <div className="flex flex-wrap gap-2">
              {REPLY_TEMPLATES.map((t, i) => (
                <button
                  key={i}
                  onClick={() => handleTextChange(t)}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-[#16A6A1]/10 hover:text-[#16A6A1] border border-slate-200 hover:border-[#16A6A1]/30 transition-all cursor-pointer"
                >
                  Template {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Reply Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700">
              Your Response <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={reply}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Write a professional response to this review..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#16A6A1]/40 focus:border-[#16A6A1] focus:outline-none resize-none transition-all"
            />
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-400">
                This reply will be stored as an operator note on the review.
              </p>
              <span className={`text-[10px] font-bold ${charCount > MAX_CHARS * 0.9 ? 'text-amber-600' : 'text-slate-400'}`}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {/* Success state */}
          {submitted && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-800">
                Response submitted successfully!
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {!submitted && (
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reply.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#0B3A53] hover:bg-[#146C86] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Response
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
