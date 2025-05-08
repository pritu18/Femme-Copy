
import React from 'react';
import { 
  Droplet, 
  Thermometer, 
  Headphones, 
  Coffee, 
  Frown, 
  Heart, 
  Grid, 
  Activity,
  Zap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type SymptomType = 
  | "cramps" 
  | "headache" 
  | "bloating" 
  | "fatigue" 
  | "acne" 
  | "cravings" 
  | "mood_swings" 
  | "breast_tenderness"
  | undefined;

interface SymptomSelectorProps {
  selectedSymptoms: SymptomType[];
  onSymptomToggle: (symptom: SymptomType) => void;
}

// Function to get icon for symptom
export const getSymptomIcon = (symptom: SymptomType, size: number = 16) => {
  if (!symptom) return null;
  
  const iconProps = { size, className: "text-femme-burgundy" };
  
  switch (symptom) {
    case "cramps":
      return <Zap {...iconProps} />;
    case "headache":
      return <Thermometer {...iconProps} />;
    case "bloating":
      return <Droplet {...iconProps} />;
    case "fatigue":
      return <Coffee {...iconProps} />;
    case "acne":
      return <Frown {...iconProps} />;
    case "cravings":
      return <Heart {...iconProps} />;
    case "mood_swings":
      return <Activity {...iconProps} />;
    case "breast_tenderness":
      return <Grid {...iconProps} />;
    default:
      return null;
  }
};

// Function to get label for symptom
export const getSymptomLabel = (symptom: SymptomType): string => {
  if (!symptom) return '';
  
  // Use a simple approach for now to avoid translation errors
  const labels: Record<SymptomType, string> = {
    "cramps": "Cramps",
    "headache": "Headache",
    "bloating": "Bloating",
    "fatigue": "Fatigue",
    "acne": "Acne",
    "cravings": "Cravings",
    "mood_swings": "Mood Swings",
    "breast_tenderness": "Breast Tenderness",
    "undefined": ""
  };
  
  return labels[symptom] || symptom;
};

const SymptomSelector: React.FC<SymptomSelectorProps> = ({ 
  selectedSymptoms, 
  onSymptomToggle 
}) => {
  const { t } = useTranslation();
  
  const symptoms: SymptomType[] = [
    "cramps", 
    "headache", 
    "bloating", 
    "fatigue", 
    "acne", 
    "cravings", 
    "mood_swings", 
    "breast_tenderness"
  ];
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {symptoms.map((symptom) => (
        <button
          key={symptom}
          type="button"
          onClick={() => onSymptomToggle(symptom)}
          className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
            selectedSymptoms.includes(symptom)
              ? "bg-femme-pink text-white border-femme-burgundy"
              : "bg-white text-femme-burgundy border-femme-taupe hover:bg-femme-pink-light/30"
          }`}
        >
          {getSymptomIcon(symptom)}
          <span className="text-sm">
            {getSymptomLabel(symptom)}
          </span>
        </button>
      ))}
    </div>
  );
};

export default SymptomSelector;
