import React, { useState } from 'react';
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Paper } from '@mui/material';

const MethodSelector = ({ onSelect }) => {
  const [method, setMethod] = useState(null);

  const handleMethodChange = (event) => {
    const selectedMethod = event.target.value;
    setMethod(selectedMethod);
    onSelect({
      method: selectedMethod
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Wybierz metodę usuwania niespójności:
      </Typography>
      
      <RadioGroup
        aria-label="method"
        name="method"
        onChange={handleMethodChange}
      >
        <Paper sx={{ p: 2, mb: 2 }}>
          <FormControlLabel
            value="qualitative"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="subtitle1">Metoda jakościowa</Typography>
                <Typography variant="body2" color="text.secondary">
                  Metoda oparta na teorii zbiorów przybliżonych, wykorzystująca dolne i górne przybliżenia.
                  Odpowiednia dla małych zbiorów danych, gdzie jakość i precyzja są kluczowe.
                </Typography>
              </Box>
            }
          />
        </Paper>

        <Paper sx={{ p: 2 }}>
          <FormControlLabel
            value="quantitative"
            control={<Radio />}
            label={
              <Box>
                <Typography variant="subtitle1">Metoda ilościowa</Typography>
                <Typography variant="body2" color="text.secondary">
                  Metoda oparta na analizie statystycznej, wykorzystująca wsparcie i pewność reguł.
                  Odpowiednia dla dużych zbiorów danych, gdzie istotna jest efektywność przetwarzania.
                </Typography>
              </Box>
            }
          />
        </Paper>
      </RadioGroup>
    </Box>
  );
};

export default MethodSelector; 