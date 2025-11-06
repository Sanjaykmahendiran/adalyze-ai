"use client";

import React, { useEffect, useRef, useState } from "react";

export default function AddLogoToSvgTemplate() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<any>(null);
  const [mainText, setMainText] = useState("Merry Christmas");
  const [subText, setSubText] = useState("AND A HAPPY NEW YEAR");
  const [accentColor, setAccentColor] = useState("#DB4900");
  const [themeColor, setThemeColor] = useState("#DB4900");
  const [logos, setLogos] = useState<
    { id: string; src: string; object?: any }[]
  >([]);

  // Initialize Fabric canvas
  useEffect(() => {
    let fabricInstance: any;

    (async () => {
      const fabricModule = await import("fabric");
      const fabric =
        (fabricModule as any).fabric || fabricModule.default || fabricModule;

      const c = new fabric.Canvas(canvasRef.current, {
        width: 600,
        height: 600,
        preserveObjectStacking: true,
      });
      setCanvas(c);

      // Load SVG template
      fabric.loadSVGFromURL("/merry-christmas.svg", (objects: any, options: any) => {
        const svgGroup = fabric.util.groupSVGElements(objects, options);
        svgGroup.scaleToWidth(600);
        svgGroup.set({
          left: 0,
          top: 0,
          selectable: false,
          evented: false,
        });
        c.add(svgGroup);
        c.sendToBack(svgGroup);

        // Add color tint overlay
        const overlay = new fabric.Rect({
          left: 0,
          top: 0,
          width: c.width,
          height: c.height,
          fill: themeColor,
          opacity: 0.35,
          selectable: false,
          evented: false,
        });
        c.add(overlay);
        c.sendToBack(overlay);
        c.renderAll();
      });

      // Add editable texts
      const main = new fabric.Textbox(mainText, {
        left: 150,
        top: 280,
        width: 300,
        fontSize: 60,
        fontFamily: "Great Vibes, cursive",
        fill: accentColor,
        shadow: new fabric.Shadow({ color: accentColor, blur: 25 }),
        textAlign: "center",
      });

      const sub = new fabric.Textbox(subText, {
        left: 160,
        top: 350,
        width: 280,
        fontSize: 20,
        fontFamily: "Poppins, sans-serif",
        fill: "#ffffff",
        textAlign: "center",
      });

      c.add(main, sub);
      c.renderAll();

      fabricInstance = c;
    })();

    return () => {
      if (fabricInstance) fabricInstance.dispose();
    };
  }, []);

  // 🧠 Handle Background Theme
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setThemeColor(color);

    const overlay = canvas
      ?.getObjects()
      .find((obj: any) => obj.type === "rect" && obj.opacity === 0.35);
    if (overlay) {
      overlay.set("fill", color);
      canvas.renderAll();
    }
  };

  // 🖼️ Upload New Logo (supports multiple)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas) return;
    const files = e.target.files;
    if (!files?.length) return;

    const fabricModule = await import("fabric");
    const fabric =
      (fabricModule as any).fabric || fabricModule.default || fabricModule;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        fabric.Image.fromURL(reader.result as string, (img: any) => {
          img.scaleToWidth(120);
          img.set({
            left: Math.random() * 200 + 50,
            top: Math.random() * 200 + 50,
            selectable: true,
            hasControls: true,
            cornerStyle: "circle",
            borderColor: "#DB4900",
            cornerColor: "#DB4900",
          });

          const id = crypto.randomUUID();
          img.customId = id;

          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();

          setLogos((prev) => [
            ...prev,
            { id, src: reader.result as string, object: img },
          ]);
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // 🧹 Remove a logo from both canvas + list
  const removeLogo = (id: string) => {
    if (!canvas) return;
    const logoObj = logos.find((l) => l.id === id);
    if (logoObj?.object) {
      canvas.remove(logoObj.object);
      canvas.renderAll();
    }
    setLogos((prev) => prev.filter((l) => l.id !== id));
  };

  // 🎯 Focus a logo on canvas from sidebar click
  const focusLogo = (id: string) => {
    if (!canvas) return;
    const logoObj = logos.find((l) => l.id === id);
    if (logoObj?.object) {
      canvas.setActiveObject(logoObj.object);
      canvas.renderAll();
    }
  };

  // 💾 Download poster
  const handleDownload = () => {
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "poster_with_logos.png";
    link.href = canvas.toDataURL({ format: "png", quality: 1 });
    link.click();
  };

  return (
    <div className="p-6 bg-[#121212] min-h-screen text-white flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold text-[#DB4900]">🪄 Adalyze Poster Editor</h2>

      <canvas
        ref={canvasRef}
        className="rounded-xl shadow-lg border border-[#2b2b2b]"
      />

      {/* ---- Controls ---- */}
      <div className="flex flex-wrap gap-6 justify-center mt-6">
        {/* Text Inputs */}
        <div className="flex flex-col">
          <label>Main Text</label>
          <input
            type="text"
            value={mainText}
            onChange={(e) => {
              setMainText(e.target.value);
              const obj = canvas?.getObjects("textbox")[0];
              if (obj) {
                obj.text = e.target.value;
                canvas.renderAll();
              }
            }}
            className="bg-[#1a1a1a] border border-[#2b2b2b] px-3 py-2 rounded"
          />
        </div>

        <div className="flex flex-col">
          <label>Sub Text</label>
          <input
            type="text"
            value={subText}
            onChange={(e) => {
              setSubText(e.target.value);
              const obj = canvas?.getObjects("textbox")[1];
              if (obj) {
                obj.text = e.target.value;
                canvas.renderAll();
              }
            }}
            className="bg-[#1a1a1a] border border-[#2b2b2b] px-3 py-2 rounded"
          />
        </div>

        {/* Colors */}
        <div className="flex flex-col">
          <label>Accent Color</label>
          <input
            type="color"
            value={accentColor}
            onChange={(e) => {
              setAccentColor(e.target.value);
              const obj = canvas?.getObjects("textbox")[0];
              if (obj) {
                const shadowColor = e.target.value;
                obj.set({
                  fill: e.target.value,
                  shadow: new (window as any).fabric.Shadow({
                    color: shadowColor,
                    blur: 25,
                  }),
                });
                canvas.renderAll();
              }
            }}
            className="w-16 h-10"
          />
        </div>

        <div className="flex flex-col">
          <label>Background Theme</label>
          <input
            type="color"
            value={themeColor}
            onChange={handleThemeChange}
            className="w-16 h-10"
          />
        </div>

        {/* Upload Multiple Logos */}
        <div className="flex flex-col">
          <label>Upload Logos</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleLogoUpload}
          />
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="bg-[#DB4900] hover:bg-[#ff5f00] px-4 py-2 rounded-lg font-semibold text-white shadow-lg"
        >
          Download Poster
        </button>
      </div>

      {/* ---- Logo List Sidebar ---- */}
      {logos.length > 0 && (
        <div className="mt-8 bg-[#1a1a1a] p-4 rounded-xl border border-[#2b2b2b] w-full sm:w-[600px]">
          <h3 className="text-lg font-semibold text-[#DB4900] mb-3">
            Uploaded Logos
          </h3>
          <div className="flex flex-wrap gap-4">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="flex flex-col items-center bg-[#222] p-2 rounded-lg"
              >
                <img
                  src={logo.src}
                  alt="Logo"
                  className="w-16 h-16 object-contain cursor-pointer border border-[#333] rounded-md hover:scale-105 transition"
                  onClick={() => focusLogo(logo.id)}
                />
                <button
                  onClick={() => removeLogo(logo.id)}
                  className="mt-2 text-xs text-red-400 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
