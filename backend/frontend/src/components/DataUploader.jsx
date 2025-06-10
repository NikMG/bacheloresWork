import React, { useCallback } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useDropzone } from 'react-dropzone';

const DataUploader = ({ onUpload }) => {
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    onUpload(file);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed #ccc',
        borderRadius: 2,
        p: 3,
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#f0f0f0' : 'transparent',
      }}
    >
      <input {...getInputProps()} />
      <Typography variant="body1">
        {isDragActive
          ? 'Upuść plik tutaj...'
          : 'Przeciągnij i upuść plik CSV lub Excel, lub kliknij aby wybrać plik'}
      </Typography>
      <Button variant="contained" sx={{ mt: 2 }}>
        Wybierz plik
      </Button>
    </Box>
  );
};

export default DataUploader; 