import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReactJson from 'react-json-view';

const ResultsViewer = ({ results }) => {
  // Handle both qualitative and quantitative results
  const { result, steps } = results;
  const { consistent_data, removed_objects, rules, approximations, metrics, summary } = result;

  // Get original data from first step
  const originalData = steps[0].data || {};
  
  // Helper function to transform data for horizontal display
  const transformDataForHorizontalDisplay = (data) => {
    if (!data) return {};
    
    const transformedData = {};
    const attributes = new Set();
    
    // Extract all attributes from the data
    Object.values(data).forEach(obj => {
      if (obj) {
        Object.keys(obj).forEach(attr => attributes.add(attr));
      }
    });
    
    // For each attribute, create a row
    attributes.forEach(attr => {
      transformedData[attr] = {};
      
      // For each object id, add its value for this attribute
      Object.keys(data).forEach(objId => {
        if (data[objId] && data[objId][attr] !== undefined) {
          transformedData[attr][objId] = data[objId][attr];
        } else {
          transformedData[attr][objId] = '';
        }
      });
    });
    
    return transformedData;
  };
  
  // Transform data for horizontal display
  const transformedOriginalData = transformDataForHorizontalDisplay(originalData);
  const transformedConsistentData = transformDataForHorizontalDisplay(consistent_data || {});
  
  // Get object IDs for column headers
  const originalObjectIds = Object.keys(originalData || {});
  const consistentObjectIds = Object.keys(consistent_data || {});
  
  // Get attribute names for row headers
  const attributeNames = Object.keys(transformedOriginalData);

  // Format rules in the specified format
  const formatRules = (rules) => {
    if (!rules || !rules.length) return null;

    return rules.map((rule, index) => {
      const conditions = Object.entries(rule.condition)
        .map(([attr, value]) => `${attr} = ${value}`)
        .join(' ∧ ');
      
      return (
        <Typography key={index} variant="body1" component="div" sx={{ mb: 2 }}>
          <strong>Reguła {index + 1}:</strong><br />
          Jeśli ({conditions})<br />
          To decyzja = {rule.decision}<br />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Wsparcie: {rule.support.toFixed(2)} | Pewność: {rule.confidence.toFixed(2)} | Waga: {rule.weight.toFixed(2)} | Częstotliwość: {rule.decision_frequency}
          </Typography>
        </Typography>
      );
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Wyniki przetwarzania
      </Typography>

      {summary && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Podsumowanie:
          </Typography>
          <Typography variant="body1">
            Wejściowa liczba wierszy: {summary.original_size}
          </Typography>
          <Typography variant="body1">
            Liczba wierszy po usunięciu niespójności: {summary.consistent_size}
          </Typography>
          <Typography variant="body1">
            Liczba zmodyfikowanych obiektów: {summary.removed_count}
          </Typography>
          {summary.rules_count && (
            <Typography variant="body1">
              Liczba reguł: {summary.rules_count}
            </Typography>
          )}
          {summary.threshold && (
            <Typography variant="body1">
              Próg wagowy: {summary.threshold}
            </Typography>
          )}
        </Paper>
      )}

      {originalObjectIds.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Dane oryginalne:
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Atrybut</TableCell>
                  {originalObjectIds.map((objId) => (
                    <TableCell 
                      key={objId} 
                      sx={removed_objects?.includes(objId) ? { backgroundColor: '#ffebee' } : {}}
                    >
                      {objId}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {attributeNames.map((attr) => (
                  <TableRow key={attr}>
                    <TableCell component="th" scope="row">{attr}</TableCell>
                    {originalObjectIds.map((objId) => (
                      <TableCell 
                        key={`${attr}-${objId}`}
                        sx={removed_objects?.includes(objId) ? { backgroundColor: '#ffebee' } : {}}
                      >
                        {transformedOriginalData[attr] && transformedOriginalData[attr][objId] !== undefined 
                          ? transformedOriginalData[attr][objId] 
                          : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {consistentObjectIds.length > 0 && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Spójne dane:
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Atrybut</TableCell>
                  {consistentObjectIds.map((objId) => (
                    <TableCell key={objId}>{objId}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {attributeNames.map((attr) => (
                  <TableRow key={attr}>
                    <TableCell component="th" scope="row">{attr}</TableCell>
                    {consistentObjectIds.map((objId) => (
                      <TableCell key={`${attr}-${objId}`}>
                        {transformedConsistentData[attr] && transformedConsistentData[attr][objId] !== undefined 
                          ? transformedConsistentData[attr][objId] 
                          : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Liczba niespójnych obiektów:
        </Typography>
        <Typography variant="body1">
          {removed_objects && removed_objects.length > 0 ? removed_objects.join(', ') : 'Brak usuniętych obiektów'}
        </Typography>
      </Paper>

      {rules && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Wygenerowane reguły:
          </Typography>
          {formatRules(rules)}
        </Paper>
      )}

      {metrics && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Metryki reguł:
          </Typography>
          <ReactJson
            src={metrics}
            name="metrics"
            collapsed={1}
            displayDataTypes={false}
            displayObjectSize={false}
          />
        </Paper>
      )}

      {approximations && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Aproksymacje:
          </Typography>
          {Object.entries(approximations).map(([decision, approx]) => (
            <Box key={decision} sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                Decyzja: {decision}
              </Typography>
              <Typography variant="body2">
                Dolne przybliżenie: {approx.dolne?.join(', ') || 'Brak'}
              </Typography>
              <Typography variant="body2">
                Górne przybliżenie: {approx.gorne?.join(', ') || 'Brak'}
              </Typography>
              <Typography variant="body2">
                Dokładność: {approx.dokladnosc?.toFixed(2) || '0.00'}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default ResultsViewer; 