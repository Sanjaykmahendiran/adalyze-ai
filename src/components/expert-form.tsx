import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

const ExpertConsultationPopup = ({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) => {
  const [formData, setFormData] = useState({
    prefdate: '',
    preftime: '',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setFormData({ prefdate: '', preftime: '', comments: '' });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-[#db4900]/30 rounded-2xl max-w-md w-full p-6 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="bg-[#db4900]/20 p-3 rounded-full">
            <MessageCircle className="w-6 h-6 text-[#db4900]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#db4900]">Talk to Expert</h3>
            <p className="text-sm text-gray-300">Schedule a consultation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              value={formData.prefdate}
              onChange={(e) => setFormData({ ...formData, prefdate: e.target.value })}
              className="w-full px-3 py-2 bg-[#171717] border border-[#3d3d3d] rounded-lg text-white focus:outline-none focus:border-[#db4900]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preferred Time
            </label>
            <Select
              value={formData.preftime}
              onValueChange={(value) =>
                setFormData({ ...formData, preftime: value })
              }
            >
              <SelectTrigger className="w-full bg-[#171717] border border-[#3d3d3d] rounded-lg text-white focus:outline-none focus:border-[#db4900]">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="bg-[#171717] border border-[#3d3d3d] text-white">
                <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                <SelectItem value="05:00 PM">05:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comments
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              placeholder="What would you like to discuss?"
              className="w-full px-3 py-2 bg-[#171717] border border-[#3d3d3d] rounded-lg text-white focus:outline-none focus:border-[#db4900] h-24 resize-none"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="text-gray-300 border-[#3d3d3d] hover:bg-[#171717]"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#db4900] hover:bg-[#db4900]/80 text-white font-semibold flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Schedule Consultation'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpertConsultationPopup;