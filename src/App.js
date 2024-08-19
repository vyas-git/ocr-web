import React, { useEffect, useState } from "react";
import { createWorker } from "tesseract.js";
import "./App.css";

function App() {
  const [workDone, setworkDone] = useState(0);
  const [ocr, setOcr] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [imageSrc, setImageSrc] = useState(null);

  const worker = createWorker({
    logger: (m) => setworkDone(m.progress),
  });

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 800; // Maximum width of the image
          const scaleSize = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const resizedImageUrl = canvas.toDataURL("image/jpeg", 0.7); // Resize and compress image
          setImageSrc(resizedImageUrl);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const doOCR = async (image) => {
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data: { text } } = await worker.recognize(image);
    setOcr(text);
    extractMobileNumber(text); // Extract mobile number after OCR
  };

  const extractMobileNumber = (text) => {
    // Regular expression to match Somali phone numbers (10 digits in total)
    const somaliPhoneNumberRegex = /(\+252|0)?\d{9}/g;
    const matches = text.match(somaliPhoneNumberRegex);
    if (matches) {
      setMobileNumber(matches[0]); // Assuming the first match is the desired number
    } else {
      setMobileNumber("No mobile number found");
    }
  };

  useEffect(() => {
    if (imageSrc) {
      doOCR(imageSrc);
    }
  }, [imageSrc]);

  return (
    <main>
      {/* Replace File Input with Scan Icon */}
      <label htmlFor="file-upload" style={{ cursor: "pointer" }}>
        <h1>Click to scan</h1>
        <img
          src="./qr-code-scan_3126504.png" // Replace with your icon URL
          alt="Scan"
          style={{ width: 250, height: 250 }}
        />
      </label>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageChange}
        style={{ display: "none" }}
      />

      {imageSrc && (
        <div>
          <span>Captured Image:</span> <br />
          <img src={imageSrc} width={200} height={200} alt="Captured" />
        </div>
      )}

      <div className="App">
        {/* Replace text with a progress bar */}
        <div style={{ width: "100%", backgroundColor: "#e0e0e0" }}>
          <div
            style={{
              width: `${Math.round(workDone * 100)}%`,
              backgroundColor: "#76c7c0",
              height: "20px",
            }}
          />
        </div>
        <br />
        {/* <p>Recognized Text: {ocr}</p> */}
        <br />
        {mobileNumber && (
          <p>
            Extracted Mobile Number:{" "}
            <a href={`tel:${mobileNumber}`} style={{ textDecoration: "none", color: "blue" }}>
              {mobileNumber}
            </a>
          </p>
        )}
      </div>
    </main>
  );
}

export default App;
