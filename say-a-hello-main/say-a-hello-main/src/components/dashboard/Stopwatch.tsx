
import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface StopwatchProps {
  time?: string;
  color?: string;
}

const Stopwatch: React.FC<StopwatchProps> = ({ time = "11:35PM", color = "#ea384c" }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div 
      className="flex items-center text-white px-2 py-1 rounded-sm text-sm"
      style={{ backgroundColor: color }}
    >
      <Clock size={16} className="mr-2" />
      <span>{formatTime(currentTime)}</span>
    </div>
  );
};

export default Stopwatch;
