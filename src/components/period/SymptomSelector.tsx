
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Droplets, Thermometer, Pill, Star, Activity, Coffee } from "lucide-react";

export type SymptomType = "cramps" | "headache" | "bloating" | "fatigue" | "acne" | "cravings" | undefined;

interface SymptomSelectorProps {
  selectedSymptoms: SymptomType[];
  onSymptomToggle: (symptom: SymptomType) => void;
}

export const getSymptomIcon = (symptom: SymptomType, size = 20) => {
  switch (symptom) {
    case "cramps":
      return <Droplets size={size} className="text-red-500" />;
    case "headache":
      return <Thermometer size={size} className="text-orange-500" />;
    case "bloating":
      return <Pill size={size} className="text-purple-500" />;
    case "fatigue":
      return <Coffee size={size} className="text-blue-400" />;
    case "acne":
      return <Star size={size} className="text-yellow-500" />;
    case "cravings":
      return <Activity size={size} className="text-green-500" />;
    default:
      return null;
  }
};

export const getSymptomLabel = (symptom: SymptomType) => {
  switch (symptom) {
    case "cramps":
      return "Cramps";
    case "headache":
      return "Headache";
    case "bloating":
      return "Bloating";
    case "fatigue":
      return "Fatigue";
    case "acne":
      return "Acne";
    case "cravings":
      return "Cravings";
    default:
      return "";
  }
};

const SymptomSelector: React.FC<SymptomSelectorProps> = ({ selectedSymptoms, onSymptomToggle }) => {
  const symptoms: { type: SymptomType; label: string }[] = [
    { type: "cramps", label: "Cramps" },
    { type: "headache", label: "Headache" },
    { type: "bloating", label: "Bloating" },
    { type: "fatigue", label: "Fatigue" },
    { type: "acne", label: "Acne" },
    { type: "cravings", label: "Cravings" },
  ];

  return (
    <Card className="border-femme-taupe border-opacity-50">
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {symptoms.map((symptom) => (
            <Button
              key={symptom.type}
              variant={selectedSymptoms.includes(symptom.type) ? "default" : "outline"}
              className={`flex flex-col items-center px-3 py-2 h-auto ${
                selectedSymptoms.includes(symptom.type) 
                  ? "bg-femme-pink text-white" 
                  : "hover:bg-femme-pink-light"
              }`}
              onClick={() => onSymptomToggle(symptom.type)}
            >
              {getSymptomIcon(symptom.type)}
              <span className="text-xs mt-1">{symptom.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SymptomSelector;
