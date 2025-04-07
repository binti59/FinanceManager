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
  IconButton,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import { 
  Help as HelpIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Book as BookIcon,
  VideoLibrary as VideoLibraryIcon
} from '@mui/icons-material';

const HelpSupportPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [faqData, setFaqData] = useState([]);
  const [openContactDialog, setOpenContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // In a real app, we would fetch data from the API
    // For demo purposes, we'll use mock data
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock FAQ data
        const mockFaqData = [
          {
            id: 1,
            question: 'How do I add a new account?',
            answer: 'To add a new account, navigate to the Accounts page and click on the "Add Account" button. Fill in the required information such as account name, type, balance, and institution. Click "Save" to create the account.'
          },
          {
            id: 2,
            question: 'How do I categorize transactions?',
            answer: 'You can categorize transactions by going to the Transactions page, finding the transaction you want to categorize, and selecting a category from the dropdown menu. You can also set up automatic categorization rules in the Settings page.'
          },
          {
            id: 3,
            question: 'How do I create a budget?',
            answer: 'To create a budget, go to the Budgets page and click on "Create Budget". Select the category you want to budget for, set the amount, and choose the time period (monthly, quarterly, yearly). Click "Save" to create your budget.'
          },
          {
            id: 4,
            question: 'How do I track my financial goals?',
            answer: 'You can track your financial goals by navigating to the Goals page and clicking on "Add Goal". Enter the goal name, target amount, target date, and initial contribution. The app will track your progress and provide suggestions to help you reach your goal.'
          },
          {
            id: 5,
            question: 'How do I generate reports?',
            answer: 'To generate reports, go to the Reports page and select the type of report you want to create. You can filter by date range, accounts, and categories. Click "Generate Report" to view your financial data in various charts and tables.'
          },
          {
            id: 6,
            question: 'How do I import transactions?',
            answer: 'You can import transactions by going to the Transactions page and clicking on "Import". Select the file format (CSV, QFX, OFX), choose the file from your computer, and map the columns to the appropriate fields. Click "Import" to add the transactions to your account.'
          },
          {
            id: 7,
            question: 'How do I export my data?',
            answer: 'To export your data, go to the Reports page and click on "Export". Select the data you want to export (transactions, accounts, budgets, etc.) and the file format (CSV, PDF, Excel). Click "Export" to download the file to your computer.'
          },
          {
            id: 8,
            question: 'How do I set up recurring transactions?',
            answer: 'You can set up recurring transactions by going to the Transactions page and clicking on "Add Recurring". Enter the transaction details, select the frequency (daily, weekly, monthly, etc.), and set the start and end dates. Click "Save" to create the recurring transaction.'
          },
          {
            id: 9,
            question: 'How do I use the FIRE calculator?',
            answer: 'The FIRE (Financial Independence, Retire Early) calculator can be accessed from the Investments page. Enter your current age, retirement age, current savings, annual income, expenses, and expected investment returns. The calculator will show you when you can achieve financial independence.'
          },
          {
            id: 10,
            question: 'How do I secure my account?',
            answer: 'To secure your account, go to the Settings page and navigate to the Security section. Enable two-factor authentication, set a strong password, and configure session timeout settings. We also recommend regularly reviewing your account activity.'
          }
        ];
        
        setFaqData(mockFaqData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  const handleOpenContactDialog = () => {
    setOpenContactDialog(true);
  };

  const handleCloseContactDialog = () => {
    setOpenContactDialog(false);
  };

  const handleContactFormChange = (field, value) => {
    setContactForm({
      ...contactForm,
      [field]: value
    });
  };

  const handleSubmitContactForm = () => {
    // In a real app, we would send the form data to the API
    // For demo purposes, we'll just show an alert
    alert(`Thank you for contacting us, ${contactForm.name}! We will respond to your inquiry as soon as possible.`);
    handleCloseContactDialog();
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter FAQs based on search query
  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Typography variant="h4" gutterBottom>
        Help & Support
      </Typography>
      
      {/* Search and Contact */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Search for help topics"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Type keywords to find answers..."
              variant="outlined"
              InputProps={{
                startAdornment: <HelpIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<QuestionAnswerIcon />}
              onClick={handleOpenContactDialog}
              size="large"
            >
              Contact Support
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Help Categories */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mb: 2 }}>
              <BookIcon fontSize="large" />
            </Avatar>
            <Typography variant="h6" align="center" gutterBottom>
              User Guide
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Comprehensive documentation on how to use all features of the app
            </Typography>
            <Button sx={{ mt: 2 }} variant="outlined">
              View Guide
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 60, height: 60, mb: 2 }}>
              <VideoLibraryIcon fontSize="large" />
            </Avatar>
            <Typography variant="h6" align="center" gutterBottom>
              Video Tutorials
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Step-by-step video guides for common tasks and features
            </Typography>
            <Button sx={{ mt: 2 }} variant="outlined">
              Watch Videos
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Avatar sx={{ bgcolor: 'success.main', width: 60, height: 60, mb: 2 }}>
              <EmailIcon fontSize="large" />
            </Avatar>
            <Typography variant="h6" align="center" gutterBottom>
              Email Support
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Get help via email from our dedicated support team
            </Typography>
            <Button sx={{ mt: 2 }} variant="outlined">
              Email Us
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Avatar sx={{ bgcolor: 'warning.main', width: 60, height: 60, mb: 2 }}>
              <PhoneIcon fontSize="large" />
            </Avatar>
            <Typography variant="h6" align="center" gutterBottom>
              Phone Support
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary">
              Speak directly with a support representative
            </Typography>
            <Button sx={{ mt: 2 }} variant="outlined">
              Call Us
            </Button>
          </Card>
        </Grid>
      </Grid>
      
      {/* Frequently Asked Questions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Frequently Asked Questions
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {filteredFaqs.length > 0 ? (
          <List>
            {filteredFaqs.map((faq, index) => (
              <React.Fragment key={faq.id}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <QuestionAnswerIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="h6">{faq.question}</Typography>}
                    secondary={
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body1"
                        color="text.primary"
                      >
                        {faq.answer}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < filteredFaqs.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box textAlign="center" py={3}>
            <Typography variant="body1" color="text.secondary">
              No results found for "{searchQuery}". Try a different search term or contact support.
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Contact Dialog */}
      <Dialog open={openContactDialog} onClose={handleCloseContactDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Contact Support
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Fill out the form below and our support team will get back to you as soon as possible.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={contactForm.name}
                onChange={(e) => handleContactFormChange('name', e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={contactForm.email}
                onChange={(e) => handleContactFormChange('email', e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                value={contactForm.subject}
                onChange={(e) => handleContactFormChange('subject', e.target.value)}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                value={contactForm.message}
                onChange={(e) => handleContactFormChange('message', e.target.value)}
                required
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseContactDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmitContactForm} 
            variant="contained"
            disabled={!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HelpSupportPage;
