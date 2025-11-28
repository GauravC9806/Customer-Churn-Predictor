import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface CsvUploadProps {
  onUploadComplete?: () => void;
}

export function CsvUpload({ onUploadComplete }: CsvUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCsvData = useMutation(api.csvUpload.uploadCsvData);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    setIsUploading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("CSV file must contain at least a header and one data row");
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const customers = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === headers.length) {
          const customer: any = {};
          headers.forEach((header, index) => {
            let value: any = values[index];
            
            // Try to convert to number if it looks like a number
            if (!isNaN(Number(value)) && value !== '') {
              value = Number(value);
            }
            
            customer[header] = value;
          });
          customers.push(customer);
        }
      }

      if (customers.length === 0) {
        toast.error("No valid customer data found in CSV");
        return;
      }

      const result = await uploadCsvData({ customers });
      toast.success(`Successfully uploaded ${result.successCount} customers${result.errorCount > 0 ? ` (${result.errorCount} errors)` : ''}`);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("CSV upload error:", error);
      toast.error("Failed to upload CSV file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleLoadTrainingData = async () => {
    setIsUploading(true);
    try {
      // Fetch the training data from the public folder
      const response = await fetch('/telecom_churn_train.csv');
      if (!response.ok) {
        throw new Error('Failed to fetch training data');
      }
      
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast.error("CSV file must contain at least a header and one data row");
        return;
      }

      // Parse CSV
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const customers = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length === headers.length) {
          const customer: any = {};
          headers.forEach((header, index) => {
            let value: any = values[index];
            
            // Try to convert to number if it looks like a number
            if (!isNaN(Number(value)) && value !== '') {
              value = Number(value);
            }
            
            customer[header] = value;
          });
          customers.push(customer);
        }
      }

      if (customers.length === 0) {
        toast.error("No valid customer data found in CSV");
        return;
      }

      const result = await uploadCsvData({ customers });
      toast.success(`Successfully loaded ${result.successCount} customers from training data${result.errorCount > 0 ? ` (${result.errorCount} errors)` : ''}`);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Failed to load training data:", error);
      toast.error("Failed to load training data. Please try uploading the file manually.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Upload Customer Data</h3>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? "border-blue-500 bg-blue-50" 
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="text-4xl">📊</div>
          <div>
            <h4 className="text-lg font-medium text-gray-900">Upload CSV File</h4>
            <p className="text-sm text-gray-600 mt-1">
              Drag and drop your telecom customer data CSV file here, or click to browse
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? "Uploading..." : "Choose CSV File"}
            </button>
            <button
              onClick={handleLoadTrainingData}
              disabled={isUploading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? "Loading..." : "📊 Load Training Data"}
            </button>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Expected columns:</strong></p>
            <p>customerID, gender, SeniorCitizen, Partner, Dependents, tenure, PhoneService,</p>
            <p>MultipleLines, InternetService, OnlineSecurity, OnlineBackup, DeviceProtection,</p>
            <p>TechSupport, StreamingTV, StreamingMovies, Contract, PaperlessBilling,</p>
            <p>PaymentMethod, MonthlyCharges, TotalCharges, Churn</p>
            <p className="text-blue-600 mt-2">💡 The system will automatically handle different column formats</p>
          </div>
        </div>
      </div>
      
      {isUploading && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-sm text-blue-700">Processing CSV file...</span>
          </div>
        </div>
      )}
    </div>
  );
}
