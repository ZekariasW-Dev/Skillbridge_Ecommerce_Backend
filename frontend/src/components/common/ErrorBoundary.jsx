import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
} from '@mui/material';
import { ErrorOutline, Refresh } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="50vh"
            textAlign="center"
          >
            <Paper sx={{ p: 4, maxWidth: 500 }}>
              <ErrorOutline sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Oops! Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </Typography>
              
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReload}
                sx={{ mt: 2 }}
              >
                Refresh Page
              </Button>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box mt={3} textAlign="left">
                  <Typography variant="h6" color="error" gutterBottom>
                    Error Details:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      backgroundColor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.8rem',
                    }}
                  >
                    {this.state.error.toString()}
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;