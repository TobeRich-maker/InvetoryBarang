"use client";

import { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import Alert from "@mui/material/Alert";
import Quagga from "quagga";

const BarcodeScanner = ({ onBarcodeScanned }) => {
  const [open, setOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [barcode, setBarcode] = useState("");
  const scannerRef = useRef(null);

  const handleOpen = () => {
    setOpen(true);
    setError("");
    setBarcode("");
  };

  const handleClose = () => {
    if (scanning && Quagga?.stop) {
      try {
        Quagga.stop();
      } catch (err) {
        console.warn("Quagga stop error:", err);
      }
      setScanning(false);
    }
    setOpen(false);
  };

  const startScanner = () => {
    setScanning(true);
    setError("");

    if (scannerRef.current) {
      Quagga.init(
        {
          inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerRef.current,
            constraints: {
              facingMode: "environment",
            },
          },
          decoder: {
            readers: [
              "ean_reader",
              "ean_8_reader",
              "code_128_reader",
              "code_39_reader",
              "upc_reader",
            ],
          },
        },
        (err) => {
          if (err) {
            console.error("Error starting Quagga:", err);
            setError(
              "Could not initialize scanner. Please make sure your browser has camera access."
            );
            setScanning(false);
            return;
          }

          Quagga.start();

          Quagga.onDetected((data) => {
            const code = data.codeResult.code;
            setBarcode(code);
            Quagga.stop();
            setScanning(false);

            // Pass the barcode to parent component
            onBarcodeScanned(code);
            handleClose();
          });
        }
      );
    }
  };

  useEffect(() => {
    return () => {
      if (scanning && Quagga?.stop) {
        try {
          Quagga.stop();
        } catch (err) {
          console.warn("Quagga stop error (cleanup):", err);
        }
      }
    };
  }, [scanning]);

  const handleManualEntry = () => {
    if (barcode) {
      onBarcodeScanned(barcode);
      handleClose();
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<QrCodeScannerIcon />}
        onClick={handleOpen}
      >
        Scan Barcode
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="barcode-scanner-dialog"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="barcode-scanner-dialog">Barcode Scanner</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              my: 2,
            }}
          >
            {!scanning ? (
              <>
                <Button
                  variant="contained"
                  onClick={startScanner}
                  startIcon={<QrCodeScannerIcon />}
                >
                  Start Scanner
                </Button>

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  align="center"
                >
                  Start the scanner and point your camera at a barcode
                </Typography>

                <Typography variant="subtitle2" sx={{ mt: 2 }}>
                  Or enter barcode manually:
                </Typography>

                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Enter barcode"
                  style={{
                    width: "100%",
                    padding: "8px",
                    fontSize: "16px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
              </>
            ) : (
              <>
                <Box
                  sx={{ position: "relative", width: "100%", minHeight: 300 }}
                >
                  <div
                    ref={scannerRef}
                    style={{
                      width: "100%",
                      height: "300px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <Box
                      sx={{
                        border: "2px solid red",
                        width: "80%",
                        height: "20%",
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Position barcode in the red box
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleManualEntry}
            variant="contained"
            disabled={!barcode}
          >
            Use Barcode
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BarcodeScanner;
