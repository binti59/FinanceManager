import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Upload as UploadIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

const FilesPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState([]);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('statement');
  const [uploadDescription, setUploadDescription] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For demo purposes, we'll use mock data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock files data
        const mockFiles = [
          { 
            id: 1, 
            name: 'Bank Statement - March 2025.pdf', 
            category: 'statement',
            description: 'Monthly bank statement from Chase',
            size: 1240000,
            date_uploaded: '2025-04-01T10:30:00Z',
            type: 'application/pdf'
          },
          { 
            id: 2, 
            name: 'Credit Card Statement - March 2025.pdf', 
            category: 'statement',
            description: 'Monthly credit card statement from American Express',
            size: 980000,
            date_uploaded: '2025-04-02T14:15:00Z',
            type: 'application/pdf'
          },
          { 
            id: 3, 
            name: 'Investment Report - Q1 2025.pdf', 
            category: 'investment',
            description: 'Quarterly investment report from Vanguard',
            size: 2450000,
            date_uploaded: '2025-04-03T09:45:00Z',
            type: 'application/pdf'
          },
          { 
            id: 4, 
            name: 'Tax Return 2024.pdf', 
            category: 'tax',
            description: 'Annual tax return documents',
            size: 3200000,
            date_uploaded: '2025-03-15T16:20:00Z',
            type: 'application/pdf'
          },
          { 
            id: 5, 
            name: 'Budget Plan 2025.xlsx', 
            category: 'budget',
            description: 'Annual budget planning spreadsheet',
            size: 540000,
            date_uploaded: '2025-01-05T11:10:00Z',
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
          { 
            id: 6, 
            name: 'Home Insurance Policy.pdf', 
            category: 'insurance',
            description: 'Home insurance policy document',
            size: 1850000,
            date_uploaded: '2025-02-20T13:25:00Z',
            type: 'application/pdf'
          },
          { 
            id: 7, 
            name: 'Car Insurance Policy.pdf', 
            category: 'insurance',
            description: 'Car insurance policy document',
            size: 1650000,
            date_uploaded: '2025-02-20T13:30:00Z',
            type: 'application/pdf'
          }
        ];
        
        setFiles(mockFiles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
  };

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
    setUploadFile(null);
    setUploadCategory('statement');
    setUploadDescription('');
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setUploadFile(event.target.files[0]);
    }
  };

  const handleCategoryChange = (event) => {
    setUploadCategory(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setUploadDescription(event.target.value);
  };

  const handleUpload = () => {
    // In a real app, we would send the file to the API
    // For demo purposes, we'll just update the local state
    
    if (uploadFile) {
      const newFile = {
        id: Math.max(...files.map(f => f.id), 0) + 1,
        name: uploadFile.name,
        category: uploadCategory,
        description: uploadDescription,
        size: uploadFile.size,
        date_uploaded: new Date().toISOString(),
        type: uploadFile.type
      };
      
      setFiles([newFile, ...files]);
      handleCloseUploadDialog();
    }
  };

  const handleDeleteFile = (fileId) => {
    // In a real app, we would send a delete request to the API
    // For demo purposes, we'll just update the local state
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
  };

  const handleDownloadFile = (file) => {
    // In a real app, this would download the actual file
    // For demo purposes, we'll just show an alert
    alert(`Downloading file: ${file.name}`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) {
      return <DescriptionIcon color="error" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <DescriptionIcon color="success" />;
    } else if (fileType.includes('document') || fileType.includes('word')) {
      return <DescriptionIcon color="primary" />;
    } else {
      return <FileIcon />;
    }
  };

  const getCategoryLabel = (category) => {
    const categories = {
      statement: 'Bank Statement',
      investment: 'Investment Document',
      tax: 'Tax Document',
      budget: 'Budget Document',
      insurance: 'Insurance Document',
      receipt: 'Receipt',
      other: 'Other'
    };
    return categories[category] || 'Unknown';
  };

  // Filter files based on selected tab
  const filteredFiles = tabValue === 0 
    ? files 
    : files.filter(file => {
        switch (tabValue) {
          case 1: return file.category === 'statement';
          case 2: return file.category === 'investment';
          case 3: return file.category === 'tax';
          case 4: return file.category === 'insurance';
          case 5: return file.category === 'budget' || file.category === 'receipt';
          default: return true;
        }
      });

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Files & Documents</Typography>
        <Button
          variant="contained"
          startIcon={<UploadIcon />}
          onClick={handleOpenUploadDialog}
        >
          Upload File
        </Button>
      </Box>

      {/* File Categories Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="All Files" />
          <Tab label="Bank Statements" />
          <Tab label="Investment Documents" />
          <Tab label="Tax Documents" />
          <Tab label="Insurance" />
          <Tab label="Budget & Receipts" />
        </Tabs>
      </Paper>

      {/* Files List */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {getFileIcon(file.type)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {file.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{getCategoryLabel(file.category)}</TableCell>
                    <TableCell>{file.description}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>{format(new Date(file.date_uploaded), 'MMM dd, yyyy')}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadFile(file)}
                        aria-label="download"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteFile(file.id)}
                        aria-label="delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No files found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload File
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Box 
              sx={{ 
                border: '2px dashed #ccc', 
                borderRadius: 2, 
                p: 3, 
                mb: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.02)'
                }
              }}
              onClick={() => document.getElementById('file-upload').click()}
            >
              <input
                type="file"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <UploadIcon fontSize="large" color="primary" />
              <Typography variant="body1" gutterBottom>
                Click to select a file or drag and drop here
              </Typography>
              {uploadFile && (
                <Typography variant="body2" color="primary">
                  Selected: {uploadFile.name} ({formatFileSize(uploadFile.size)})
                </Typography>
              )}
            </Box>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-label">File Category</InputLabel>
              <Select
                labelId="category-label"
                id="category"
                value={uploadCategory}
                label="File Category"
                onChange={handleCategoryChange}
              >
                <MenuItem value="statement">Bank Statement</MenuItem>
                <MenuItem value="investment">Investment Document</MenuItem>
                <MenuItem value="tax">Tax Document</MenuItem>
                <MenuItem value="budget">Budget Document</MenuItem>
                <MenuItem value="insurance">Insurance Document</MenuItem>
                <MenuItem value="receipt">Receipt</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Description"
              name="description"
              value={uploadDescription}
              onChange={handleDescriptionChange}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            variant="contained"
            disabled={!uploadFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilesPage;
