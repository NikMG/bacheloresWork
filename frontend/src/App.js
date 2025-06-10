import React, { useState } from 'react';
import { Container, Box, Typography, Paper, Button } from '@mui/material';
import DataUploader from './components/DataUploader';
import MethodSelector from './components/MethodSelector';
import ResultsViewer from './components/ResultsViewer';
import CalculationSteps from './components/CalculationSteps';

function App() {
  const [data, setData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [results, setResults] = useState(null);
  const [showSteps, setShowSteps] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleDataUpload = (file) => {
    setData(file);
    setResults(null);
    setShowSteps(false);
    setError(null);
  };

  const handleMethodSelect = (params) => {
    setSelectedMethod(params.method);
  };

  const handleProcessData = async () => {
    if (!selectedMethod || !data) {
      setError('Please select a method and upload data first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', data);
      formData.append('method', selectedMethod);

      const response = await fetch('http://localhost:8000/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process data');
      }

      const result = await response.json();
      setResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          System Usuwania Niespójności
        </Typography>
        
        <Paper sx={{ p: 2, mb: 2 }}>
          <DataUploader onUpload={handleDataUpload} />
        </Paper>

        {data && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <MethodSelector onSelect={handleMethodSelect} />
          </Paper>
        )}

        {data && selectedMethod && (
          <Paper sx={{ p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="contained" 
                onClick={handleProcessData}
                color="primary"
              >
                Przetwórz dane
              </Button>
              <Button 
                variant="outlined"
                onClick={() => setShowSteps(!showSteps)}
              >
                {showSteps ? 'Ukryj kroki obliczeń' : 'Pokaż kroki obliczeń'}
              </Button>
            </Box>
          </Paper>
        )}

        {error && (
          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#ffebee' }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {results && (
          <>
            <Paper sx={{ p: 2, mb: 2 }}>
              <ResultsViewer results={results} />
            </Paper>
            
            {showSteps && results.steps && (
              <Paper sx={{ p: 2 }}>
                <CalculationSteps steps={results.steps} />
              </Paper>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}

export default App; 