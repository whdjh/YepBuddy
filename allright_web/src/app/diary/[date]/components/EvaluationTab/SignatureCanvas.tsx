"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SignatureCanvasProps {
  onSave?: (signatureData: string) => void;
}

export default function SignatureCanvas({ onSave }: SignatureCanvasProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;

      canvas.width = rect.width * scale;
      canvas.height = rect.height * scale;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const context = canvas.getContext("2d");
      if (!context) return;

      context.scale(scale, scale);
      context.lineCap = "round";
      context.strokeStyle = "#16a34a";
      context.lineWidth = 2;
      contextRef.current = context;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const preventScroll = (e: TouchEvent) => e.preventDefault();
    canvas.addEventListener("touchstart", preventScroll, { passive: false });
    canvas.addEventListener("touchmove", preventScroll, { passive: false });
    canvas.addEventListener("touchend", preventScroll, { passive: false });

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("touchstart", preventScroll);
      canvas.removeEventListener("touchmove", preventScroll);
      canvas.removeEventListener("touchend", preventScroll);
    };
  }, []);

  const handleStartDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    if (!("touches" in event)) event.preventDefault();
    setIsDrawing(true);
    handleDraw(event);
  };

  const handleFinishDrawing = () => {
    setIsDrawing(false);
    contextRef.current?.beginPath();
  };

  const handleDraw = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    let clientX, clientY;
    const rect = canvasRef.current.getBoundingClientRect();

    if ("touches" in event) {
      const touch = event.touches[0];
      clientX = touch.clientX - rect.left;
      clientY = touch.clientY - rect.top;
    } else {
      clientX = event.clientX - rect.left;
      clientY = event.clientY - rect.top;
    }

    contextRef.current.lineTo(clientX, clientY);
    contextRef.current.stroke();
    contextRef.current.beginPath();
    contextRef.current.moveTo(clientX, clientY);
  };

  const handleClearSignature = () => {
    if (!contextRef.current || !canvasRef.current) return;
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const handleSaveSignature = () => {
    if (!canvasRef.current) return;
    const signatureData = canvasRef.current.toDataURL("image/png");
    onSave ? onSave(signatureData) : console.log("Signature saved:", signatureData);
  };

  return (
    <div>
      <div className="mb-2.5">
        <div className="relative w-full h-20">
          <canvas
            ref={canvasRef}
            className="w-full h-full border border-gray-600 rounded bg-white cursor-crosshair touch-none"
            onMouseDown={handleStartDrawing}
            onMouseUp={handleFinishDrawing}
            onMouseOut={handleFinishDrawing}
            onMouseMove={handleDraw}
            onTouchStart={handleStartDrawing}
            onTouchEnd={handleFinishDrawing}
            onTouchMove={handleDraw}
          />
        </div>
      </div>

      <div className="flex gap-2 justify-center items-center">
        <Button variant="outline" onClick={handleClearSignature} className="h-[2rem] text-sm w-[10rem]">
          지우기
        </Button>
        <Button onClick={handleSaveSignature} className="h-[2rem] text-sm w-[10rem]">
          저장
        </Button>
      </div>
    </div>
  );
}
