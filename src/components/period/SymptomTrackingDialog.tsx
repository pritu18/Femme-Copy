
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import SymptomSelector, { SymptomType } from "./SymptomSelector";
import { useTranslation } from "react-i18next";

interface SymptomTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: {
    date: Date;
    symptoms?: SymptomType[];
    notes?: string;
  } | null;
  onSave: (symptoms: SymptomType[], notes: string) => void;
}

const SymptomTrackingDialog: React.FC<SymptomTrackingDialogProps> = ({
  open,
  onOpenChange,
  selectedDay,
  onSave,
}) => {
  const { t } = useTranslation();
  const [selectedSymptoms, setSelectedSymptoms] = useState<SymptomType[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (selectedDay) {
      setSelectedSymptoms(selectedDay.symptoms || []);
      setNotes(selectedDay.notes || "");
    }
  }, [selectedDay]);

  const handleSymptomToggle = (symptom: SymptomType) => {
    if (!symptom) return;
    
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) {
        return prev.filter(s => s !== symptom);
      } else {
        return [...prev, symptom];
      }
    });
  };

  const handleSave = () => {
    onSave(selectedSymptoms, notes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {selectedDay 
              ? t("period.trackSymptoms") + ` ${format(selectedDay.date, "MMMM d, yyyy")}`
              : t("period.trackSymptoms")}
          </DialogTitle>
          <DialogDescription>
            {t("period.selectSymptoms")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <SymptomSelector 
            selectedSymptoms={selectedSymptoms}
            onSymptomToggle={handleSymptomToggle}
          />
          
          <div className="mt-4">
            <label className="text-sm font-medium text-femme-burgundy" htmlFor="symptom-notes">{t("period.notes")} ({t("period.optional")})</label>
            <Textarea 
              id="symptom-notes"
              placeholder={t("period.periodNotes")}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button onClick={handleSave}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SymptomTrackingDialog;
