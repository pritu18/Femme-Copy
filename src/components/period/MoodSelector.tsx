
import React from "react";
import { Button } from "@/components/ui/button";
import { Smile, Meh, Frown, Heart, Star, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type MoodType = "happy" | "neutral" | "sad" | "loved" | "energetic" | "tired" | undefined;

interface MoodSelectorProps {
  selectedMood: MoodType;
  onMoodSelect: (mood: MoodType) => void;
}

export const getMoodIcon = (mood: MoodType, size = 20) => {
  switch (mood) {
    case "happy":
      return <Smile size={size} className="text-femme-pink" />;
    case "neutral":
      return <Meh size={size} className="text-femme-taupe" />;
    case "sad":
      return <Frown size={size} className="text-femme-burgundy" />;
    case "loved":
      return <Heart size={size} className="text-red-500" />;
    case "energetic":
      return <Star size={size} className="text-yellow-500" />;
    case "tired":
      return <Sparkles size={size} className="text-blue-500" />;
    default:
      return null;
  }
};

export const getMoodLabel = (mood: MoodType) => {
  switch (mood) {
    case "happy":
      return "Happy";
    case "neutral":
      return "Neutral";
    case "sad":
      return "Sad";
    case "loved":
      return "Loved";
    case "energetic":
      return "Energetic";
    case "tired":
      return "Tired";
    default:
      return "Not set";
  }
};

const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
  const moods: { type: MoodType; label: string }[] = [
    { type: "happy", label: "Happy" },
    { type: "neutral", label: "Neutral" },
    { type: "sad", label: "Sad" },
    { type: "loved", label: "Loved" },
    { type: "energetic", label: "Energetic" },
    { type: "tired", label: "Tired" },
  ];

  return (
    <Card className="border-femme-taupe border-opacity-50">
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {moods.map((mood) => (
            <Button
              key={mood.type}
              variant={selectedMood === mood.type ? "default" : "outline"}
              className={`flex flex-col items-center px-3 py-2 h-auto ${
                selectedMood === mood.type ? "bg-femme-pink text-white" : "hover:bg-femme-pink-light"
              }`}
              onClick={() => onMoodSelect(mood.type)}
            >
              {getMoodIcon(mood.type)}
              <span className="text-xs mt-1">{mood.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodSelector;
