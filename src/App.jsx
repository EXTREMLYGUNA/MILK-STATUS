/* eslint-disable no-useless-escape */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import config from './config.jsx'; 

// const API_URL = 'http://localhost:5000/api/bills'; 

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      Rate: '',
      Morning: '',
      Evening: '',
      Name: '',
      Mobile: '',
      Date: format(new Date(), 'yyyy-MM-dd')
    }
  });
  
  const [bills, setBills] = useState([]);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  useEffect(() => {
    fetchBills();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${config.BASE_URL}/search?query=${searchQuery}`);
      setBills(response.data);
    } catch (error) {
      showSnackbar('Failed to search bills', error);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await axios.get(config.BASE_URL);
      setBills(response.data);
    } catch (error) {
      showSnackbar('Failed to fetch bills. Check backend connection.', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      const { Name, Mobile, Date, Morning, Evening, Rate } = data;
    
    // Convert string inputs to numbers
    const morning = parseFloat(data.Morning);
    const evening = parseFloat(data.Evening);
    const rate = parseFloat(data.Rate);

     if (isNaN(morning) || isNaN(evening) || isNaN(rate)) {
      showSnackbar('Please enter valid numbers', 'error');
      return;
    }

    const billData = {
      Name: data.Name,
      Mobile: data.Mobile,
      Date: data.Date,
      Morning: morning,  // Use the parsed morning value
      Evening: evening,  // Use the parsed evening value
      Rate: rate,       // Use the parsed rate value
      TotalLiters: morning + evening,
      TotalAmount: (morning + evening) * rate
    };

    await axios.post(config.BASE_URL, billData);
    reset();
    fetchBills();
    showSnackbar('Bill saved successfully!', 'success');
  } catch (error) {
    showSnackbar(error.response?.data?.error || 'Failed to save bill', 'error');
  }
};


  const deleteBill = async (id) => {
    try {
      await axios.delete(`${config.BASE_URL}/${id}`);
      fetchBills();
      showSnackbar('Bill deleted successfully!', 'success');
    } catch (error) {
      showSnackbar('Failed to delete bill', error);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        MILK BILL STATUS
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Search by Name or Mobile"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
        </Grid>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Customer Name"
                {...register('Name', { 
                  required: 'Name is required',
                  minLength: {
                    value: 3,
                    message: 'Name must be at least 3 characters'
                  }
                })}
                error={!!errors.Name}
                helperText={errors.Name?.message}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                {...register('Mobile', {
                  required: 'Mobile is required',
                  pattern: {
                    value: /^\d{10}$/,
                    message: 'Must be 10 digits'
                  }
                })}
                error={!!errors.Mobile}
                helperText={errors.Mobile?.message}
                inputProps={{
                  maxLength: 10
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...register('Date', { required: 'Date is required' })}
                error={!!errors.Date}
                helperText={errors.Date?.message}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rate per liter (₹)"
                type="number"
                step="0.01"
                {...register('Rate', { 
                  required: 'Rate is required',
                  validate: {
                    isPositive: v => parseFloat(v) > 0 || 'Must be positive'
                  }
                })}
                error={!!errors.Rate}
                helperText={errors.Rate?.message}
                inputProps={{
                min: "0.01",
                step: "0.01",
                pattern: "^[0-9]*\.?[0-9]*$",
                  onKeyDown: (e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Morning Milk (liters)"
                type="number"
                step="0.01"
                {...register('Morning', { 
                  required: 'Morning quantity is required',
                  validate: {
                    isNumber: v => !isNaN(parseFloat(v)) || 'Must be a number',
                    isPositive: v => parseFloat(v) >= 0 || 'Cannot be negative'
                  },
                  min: { 
                    value: 0, 
                    message: 'Cannot be negative' 
                  }
                })}
                error={!!errors.Morning}
                helperText={errors.Morning?.message}
                inputProps={{
                min: "0.01",
                step: "0.01",
                pattern: "^[0-9]*\.?[0-9]*$",
                  onKeyDown: (e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Evening Milk (liters)"
                type="number"
                step="0.01"
                {...register('Evening', { 
                  required: 'Evening quantity is required',
                  min: { 
                    value: 0, 
                    message: 'Cannot be negative' 
                  }
                })}
                error={!!errors.Evening}
                helperText={errors.Evening?.message}
                inputProps={{
                min: "0.01",
                step: "0.01",
                pattern: "^[0-9]*\.?[0-9]*$",
                  onKeyDown: (e) => ['-', 'e', 'E', '+'].includes(e.key) && e.preventDefault()
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Calculate & Save
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Typography variant="h5" gutterBottom>
        Billing History
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Morning (L)</TableCell>
              <TableCell>Evening (L)</TableCell>
              <TableCell>Total (L)</TableCell>
              <TableCell>Rate (₹)</TableCell>
              <TableCell>Amount (₹)</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
{Array.isArray(bills) && bills.length > 0 ? (
    bills.map((bill) => (
      <TableRow key={bill._id}>
        <TableCell>{bill.Date ? format(new Date(bill.Date), 'dd/MM/yyyy') : 'N/A'}</TableCell>
        <TableCell>{bill.Name}</TableCell>
        <TableCell>{bill.Mobile}</TableCell>
        <TableCell>{bill.Morning?.toFixed(2)}</TableCell>
        <TableCell>{bill.Evening?.toFixed(2)}</TableCell>
        <TableCell>{bill.TotalLiters?.toFixed(2)}</TableCell>
        <TableCell>{bill.Rate?.toFixed(2)}</TableCell>
        <TableCell>{bill.TotalAmount?.toFixed(2)}</TableCell>
        <TableCell>
          <IconButton onClick={() => deleteBill(bill._id)} color="error">
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={9} align="center">
        No bills found
      </TableCell>
    </TableRow>
  )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}