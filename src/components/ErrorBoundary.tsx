import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { errorHandlingService, ComplianceError } from '@/lib/error-handling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  savedFormData: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      savedFormData: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Save form data before error
    const formData = ErrorBoundary.saveFormData();
    
    return {
      hasError: true,
      error,
      errorInfo: null,
      savedFormData: formData
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to service
    errorHandlingService.logError(
      new ComplianceError(error.message, 'REACT_ERROR', {
        componentStack: errorInfo.componentStack
      }),
      'COMPONENT_ERROR'
    );
    
    this.setState({
      errorInfo
    });
  }

  static saveFormData() {
    // Save all form inputs to localStorage
    const forms = document.querySelectorAll('form');
    const formData: Record<string, any> = {};
    
    forms.forEach((form, index) => {
      const data: Record<string, any> = {};
      const inputs = form.querySelectorAll('input, select, textarea');
      
      inputs.forEach((input: any) => {
        if (input.name) {
          data[input.name] = input.value;
        }
      });
      
      formData[`form_${index}`] = data;
    });
    
    localStorage.setItem('errorBoundary_savedFormData', JSON.stringify(formData));
    return formData;
  }

  restoreFormData = () => {
    const savedData = localStorage.getItem('errorBoundary_savedFormData');
    if (savedData) {
      // This would need to be implemented based on your form structure
      console.log('Restoring form data:', JSON.parse(savedData));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Restore form data if available
    if (this.state.savedFormData) {
      this.restoreFormData();
    }
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4 text-center">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            
            <p className="text-gray-600">
              We encountered an unexpected error. Your work has been saved.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left text-sm bg-gray-100 p-4 rounded">
                <summary className="cursor-pointer font-semibold">
                  Error details
                </summary>
                <pre className="mt-2 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={this.handleGoBack}
                variant="outline"
              >
                Go Back
              </Button>
              <Button
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 