import { useState } from 'react';
import Papa from 'papaparse';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Upload, Download, MapPin, FileText, Calendar, Building2 } from 'lucide-react';

// Fix Leaflet default icon issue
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Property {
  Name: string;
  'Parcel ID': string;
  Address: string;
  City: string;
  State: string;
  Zip: string;
  County: string;
  Acres: string;
  'Amount Due': string;
  Latitude: string;
  Longitude: string;
  Coordinates: string;
  'Parcel Fair Report': string;
  'Next Auction': string;
}

interface ProcessedData {
  properties: Property[];
  county: string;
  auctionDate: string;
  layerName: string;
  totalProperties: number;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const processCSV = (csvFile: File) => {
    setIsProcessing(true);
    
    Papa.parse(csvFile, {
      header: true,
      complete: (results) => {
        const rows = results.data as any[];
        
        if (rows.length === 0) {
          alert('Arquivo CSV vazio!');
          setIsProcessing(false);
          return;
        }

        const firstRow = rows[0];
        const county = firstRow.County || '';
        const auctionDate = firstRow['Next Auction'] || '';
        
        let ddmm = '';
        if (auctionDate) {
          const [month, day, year] = auctionDate.split('/');
          ddmm = `${day.padStart(2, '0')}${month.padStart(2, '0')}`;
        }
        
        const layerName = `${county} ${ddmm}`;

        const properties: Property[] = rows
          .filter(row => row.Coordinates && row.Coordinates.includes(','))
          .map(row => {
            const coords = row.Coordinates.replace(/"/g, '').trim();
            const [lat, lon] = coords.split(',');
            
            return {
              Name: row.Name || '',
              'Parcel ID': row['Parcel Number'] || '',
              Address: row.Address || '',
              City: row.City || '',
              State: row.State || '',
              Zip: row.Zip || '',
              County: row.County || '',
              Acres: row.Acres || '',
              'Amount Due': row['Amount Due'] || '',
              Latitude: lat.trim(),
              Longitude: lon.trim(),
              Coordinates: coords,
              'Parcel Fair Report': row['Parcel Fair Report'] || '',
              'Next Auction': row['Next Auction'] || '',
            };
          });

        setProcessedData({
          properties,
          county,
          auctionDate,
          layerName,
          totalProperties: properties.length,
        });
        
        setIsProcessing(false);
      },
      error: (error) => {
        console.error('Erro ao processar CSV:', error);
        alert('Erro ao processar arquivo CSV!');
        setIsProcessing(false);
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processCSV(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      processCSV(droppedFile);
    } else {
      alert('Por favor, envie um arquivo CSV!');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const downloadProcessedCSV = () => {
    if (!processedData) return;

    const csv = Papa.unparse(processedData.properties);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${processedData.county}_${processedData.layerName.split(' ')[1]}_coordinates.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const mapCenter: [number, number] = processedData && processedData.properties.length > 0
    ? [parseFloat(processedData.properties[0].Latitude), parseFloat(processedData.properties[0].Longitude)]
    : [29.5, -81.5];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Google My Maps CSV Processor
          </h1>
          <p className="text-gray-600">
            Processe arquivos CSV e gere dados formatados para Google My Maps
          </p>
        </div>

        {!processedData && (
          <div className="max-w-2xl mx-auto">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-4 border-dashed rounded-lg p-12 text-center transition-all ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white hover:border-blue-400'
              }`}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Arraste e solte seu arquivo CSV aqui
              </h3>
              <p className="text-gray-500 mb-4">ou</p>
              <label className="inline-block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block">
                  Selecionar Arquivo
                </span>
              </label>
              {isProcessing && (
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Processando...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {processedData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Condado</p>
                    <p className="text-2xl font-bold text-gray-800">{processedData.county}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Data do Leilão</p>
                    <p className="text-2xl font-bold text-gray-800">{processedData.auctionDate}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Nome da Camada</p>
                    <p className="text-xl font-bold text-gray-800">{processedData.layerName}</p>
                  </div>
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Propriedades</p>
                    <p className="text-2xl font-bold text-gray-800">{processedData.totalProperties}</p>
                  </div>
                  <MapPin className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={downloadProcessedCSV}
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-2 shadow-lg"
              >
                <Download className="w-5 h-5" />
                Baixar CSV para Google My Maps
              </button>
              <button
                onClick={() => {
                  setProcessedData(null);
                  setFile(null);
                }}
                className="ml-4 bg-gray-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Processar Outro Arquivo
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Visualização no Mapa</h2>
              </div>
              <div className="h-96">
                <MapContainer
                  center={mapCenter}
                  zoom={10}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {processedData.properties.map((property, index) => (
                    <Marker
                      key={index}
                      position={[parseFloat(property.Latitude), parseFloat(property.Longitude)]}
                      icon={defaultIcon}
                    >
                      <Popup>
                        <div className="p-2">
                          <p className="font-semibold">{property.Name}</p>
                          <p className="text-sm text-gray-600">Parcel ID: {property['Parcel ID']}</p>
                          <p className="text-sm">{property.Address}</p>
                          <p className="text-sm">{property.City}, {property.State}</p>
                          <p className="text-sm font-semibold mt-1">{property.Acres} acres</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Propriedades Processadas</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Parcel ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nome</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Endereço</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cidade</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Acres</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor Devido</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Coordenadas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {processedData.properties.slice(0, 50).map((property, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{property['Parcel ID']}</td>
                        <td className="px-4 py-3 text-sm">{property.Name}</td>
                        <td className="px-4 py-3 text-sm">{property.Address}</td>
                        <td className="px-4 py-3 text-sm">{property.City}</td>
                        <td className="px-4 py-3 text-sm">{property.Acres}</td>
                        <td className="px-4 py-3 text-sm">{property['Amount Due']}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{property.Latitude}, {property.Longitude}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {processedData.totalProperties > 50 && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    Mostrando 50 de {processedData.totalProperties} propriedades
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

