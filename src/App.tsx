import { FileUpload } from './modules/CsvImporter/components/FileUpload';
import { db } from './config/firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';

interface CsvRow {
  id: string;
  fileName: string;
  uploadedAt: any;
  [key: string]: any;
}

function App() {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'csvData'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CsvRow[];
      setCsvData(data);
    });
    return unsubscribe;
  }, []);

  const handleFileSelect = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      // Save each row to Firestore
      for (const row of data) {
        await addDoc(collection(db, 'csvData'), {
          ...row,
          fileName: file.name,
          uploadedAt: new Date()
        });
      }
      
      console.log(`Uploaded ${data.length} rows`);
    } catch (error) {
      console.error('Error processing CSV:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">CSV Upload</h1>
        <FileUpload onFileSelect={handleFileSelect} />
        
        {csvData.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">CSV Data ({csvData.length} rows)</h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {csvData[0] && Object.keys(csvData[0]).filter(key => !['id', 'fileName', 'uploadedAt'].includes(key)).map(header => (
                      <th key={header} className="px-4 py-2 text-left text-sm font-medium text-gray-900">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row) => (
                    <tr key={row.id} className="border-t">
                      {Object.keys(row).filter(key => !['id', 'fileName', 'uploadedAt'].includes(key)).map(key => (
                        <td key={key} className="px-4 py-2 text-sm text-gray-700">{row[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
