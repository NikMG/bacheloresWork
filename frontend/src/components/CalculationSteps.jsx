import React, { useState } from 'react';
import { Box, Typography, Paper, Stepper, Step, StepLabel, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import ReactJson from 'react-json-view';

const CalculationSteps = ({ steps }) => {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  if (!steps || !steps[activeStep]) {
    return null;
  }

  // Helper function to transform data for horizontal display
  const transformDataForHorizontalDisplay = (data) => {
    if (!data) return { transformedData: {}, objectIds: [], attributeNames: [] };
    
    const transformedData = {};
    const attributes = new Set();
    
    Object.values(data).forEach(obj => {
      if (obj) {
        Object.keys(obj).forEach(attr => attributes.add(attr));
      }
    });
    
    attributes.forEach(attr => {
      transformedData[attr] = {};
      
      Object.keys(data).forEach(objId => {
        if (data[objId] && data[objId][attr] !== undefined) {
          transformedData[attr][objId] = data[objId][attr];
        } else {
          transformedData[attr][objId] = '';
        }
      });
    });
    
    return {
      transformedData,
      objectIds: Object.keys(data),
      attributeNames: Array.from(attributes)
    };
  };

  // Transform data if it exists in the current step
  const { transformedData, objectIds, attributeNames } = 
    transformDataForHorizontalDisplay(steps[activeStep].data);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Kroki obliczeń
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((step) => (
          <Step key={step.step}>
            <StepLabel>{step.description}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          {steps[activeStep].description}
        </Typography>
        
        {steps[activeStep].data && objectIds.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Dane:
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Atrybut</TableCell>
                    {objectIds.map((objId) => (
                      <TableCell key={objId}>{objId}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attributeNames.map((attr) => (
                    <TableRow key={attr}>
                      <TableCell component="th" scope="row">{attr}</TableCell>
                      {objectIds.map((objId) => (
                        <TableCell key={`${attr}-${objId}`}>
                          {transformedData[attr] && transformedData[attr][objId] !== undefined 
                            ? transformedData[attr][objId] 
                            : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {steps[activeStep].classes && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Klasy abstrakcji:
            </Typography>
            <ReactJson
              src={steps[activeStep].classes}
              name="classes"
              collapsed={1}
              displayDataTypes={false}
              displayObjectSize={false}
            />
          </Box>
        )}

        {steps[activeStep].approximations && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Aproksymacje:
            </Typography>
            {Object.entries(steps[activeStep].approximations).map(([decision, approx]) => (
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
          </Box>
        )}

        {steps[activeStep].rules && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Reguły:
            </Typography>
            {steps[activeStep].rules.map((rule, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  Reguła {index + 1}:
                </Typography>
                <Typography variant="body2">
                  Jeśli ({Object.entries(rule.condition).map(([attr, value]) => `${attr} = ${value}`).join(' ∧ ')})
                </Typography>
                <Typography variant="body2">
                  To decyzja = {rule.decision}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Wsparcie: {rule.support.toFixed(2)} | Pewność: {rule.confidence.toFixed(2)} | Waga: {rule.weight.toFixed(2)} | Częstotliwość: {rule.decision_frequency}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {steps[activeStep].objects && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Obiekty:
            </Typography>
            <Typography variant="body2">
              {steps[activeStep].objects.length > 0 ? steps[activeStep].objects.join(', ') : 'Brak obiektów'}
            </Typography>
          </Box>
        )}
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Wstecz
        </Button>
        <Button
          variant="contained"
          onClick={activeStep === steps.length - 1 ? handleReset : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Reset' : 'Dalej'}
        </Button>
      </Box>
    </Box>
  );
};

export default CalculationSteps; 