// src/__tests__/components/ExportButton.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExportButton from '../../components/toolbar/ExportButton';
import api from '../../lib/api';

// Mock the API module
jest.mock('../../lib/api');

// Mock DOM APIs
let mockObjectURL = '';
global.URL.createObjectURL = jest.fn((blob) => {
  mockObjectURL = 'blob:mock-url-' + Date.now();
  return mockObjectURL;
});
global.URL.revokeObjectURL = jest.fn();

// Mock alert
global.alert = jest.fn();

describe('ExportButton Component', () => {
  const defaultProps = {
    indicator: 'crime_carjacking',
    period: '2024',
    scenario: undefined,
    disabled: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset document.body to ensure clean state
    document.body.innerHTML = '';
  });

  describe('rendering', () => {
    test('renders export button', () => {
      render(<ExportButton {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Export shapefile/i })).toBeInTheDocument();
    });

    test('shows default text "Export shapefile"', () => {
      render(<ExportButton {...defaultProps} />);

      expect(screen.getByText('Export shapefile')).toBeInTheDocument();
    });

    test('applies nice-select class', () => {
      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('nice-select');
    });

    test('button type is "button"', () => {
      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('enabled/disabled states', () => {
    test('button is enabled when indicator and period are provided', () => {
      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });

    test('button is disabled when indicator is missing', () => {
      render(<ExportButton {...defaultProps} indicator="" />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('button is disabled when period is missing', () => {
      render(<ExportButton {...defaultProps} period="" />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('button is disabled when both indicator and period are missing', () => {
      render(<ExportButton indicator="" period="" />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('button is disabled when disabled prop is true', () => {
      render(<ExportButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    test('button is disabled while loading', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockResolvedValueOnce(mockBlob);

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should be disabled immediately during loading
      expect(button).toBeDisabled();
    });
  });

  describe('title attribute', () => {
    test('shows download message when enabled', () => {
      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Download shapefile (.zip)');
    });

    test('shows selection prompt when indicator is missing', () => {
      render(<ExportButton {...defaultProps} indicator="" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Select period & indicator first');
    });

    test('shows selection prompt when period is missing', () => {
      render(<ExportButton {...defaultProps} period="" />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Select period & indicator first');
    });
  });

  describe('cursor styling', () => {
    test('shows pointer cursor when enabled', () => {
      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ cursor: 'pointer' });
    });

    test('shows not-allowed cursor when disabled', () => {
      render(<ExportButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ cursor: 'not-allowed' });
    });

    test('shows not-allowed cursor when indicator is missing', () => {
      render(<ExportButton {...defaultProps} indicator="" />);

      const button = screen.getByRole('button');
      expect(button).toHaveStyle({ cursor: 'not-allowed' });
    });
  });

  describe('export functionality', () => {
    test('calls downloadShapefile API on click', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockResolvedValueOnce(mockBlob);

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(api.downloadShapefile).toHaveBeenCalledTimes(1);
      });
    });

    test('passes correct parameters to downloadShapefile', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockResolvedValueOnce(mockBlob);

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(api.downloadShapefile).toHaveBeenCalledWith({
          indicator: 'crime_carjacking',
          period: '2024',
        });
      });
    });

    test('includes scenario parameter when provided', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockResolvedValueOnce(mockBlob);

      render(<ExportButton {...defaultProps} scenario="baseline" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(api.downloadShapefile).toHaveBeenCalledWith({
          indicator: 'crime_carjacking',
          period: '2024',
          scenario: 'baseline',
        });
      });
    });

    test('creates download link with blob URL', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockResolvedValueOnce(mockBlob);

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      });
    });

    test('successfully completes export', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockResolvedValueOnce(mockBlob);

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Wait for the export to complete
      await waitFor(() => {
        expect(api.downloadShapefile).toHaveBeenCalled();
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      });
    });

    test('cleans up blob URL after download', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockResolvedValueOnce(mockBlob);

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        // Verify revoke was called (cleanup happened)
        expect(global.URL.revokeObjectURL).toHaveBeenCalled();
      });
    });
  });

  describe('loading state', () => {
    test('shows "Exporting…" text while loading', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockBlob), 100))
      );

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Should show loading text
      expect(screen.getByText('Exporting…')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Export shapefile')).toBeInTheDocument();
      });
    });

    test('returns to normal text after successful export', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockResolvedValueOnce(mockBlob);

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Export shapefile')).toBeInTheDocument();
      });
    });

    test('returns to normal text after failed export', async () => {
      api.downloadShapefile.mockRejectedValueOnce(new Error('Network error'));

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Export shapefile')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    test('shows alert on export failure', async () => {
      api.downloadShapefile.mockRejectedValueOnce(new Error('Network error'));

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Export failed: Network error');
      });
    });

    test('logs error to console', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      api.downloadShapefile.mockRejectedValueOnce(new Error('API error'));

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Export failed:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test('handles error without message', async () => {
      api.downloadShapefile.mockRejectedValueOnce('String error');

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Export failed: String error');
      });
    });

    test('re-enables button after error', async () => {
      api.downloadShapefile.mockRejectedValueOnce(new Error('Fail'));

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('default props', () => {
    test('renders with no props', () => {
      render(<ExportButton />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    test('uses empty string defaults for indicator and period', () => {
      render(<ExportButton />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Select period & indicator first');
    });

    test('disabled defaults to false', () => {
      render(<ExportButton indicator="test" period="2024" />);

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('edge cases', () => {
    test('does not export when button is disabled', () => {
      render(<ExportButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(api.downloadShapefile).not.toHaveBeenCalled();
    });

    test('does not export when already loading', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockBlob), 100))
      );

      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');

      // Click twice rapidly
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        // Should only be called once
        expect(api.downloadShapefile).toHaveBeenCalledTimes(1);
      });
    });

    test('handles numeric period', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockResolvedValueOnce(mockBlob);

      render(<ExportButton {...defaultProps} period={2024} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(api.downloadShapefile).toHaveBeenCalledWith(
          expect.objectContaining({ period: 2024 })
        );
      });
    });

    test('handles complex indicator and period values', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/zip' });
      api.downloadShapefile.mockResolvedValueOnce(mockBlob);

      render(<ExportButton indicator="crime/test" period="2023-2024" scenario="test_scenario" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(api.downloadShapefile).toHaveBeenCalledWith({
          indicator: 'crime/test',
          period: '2023-2024',
          scenario: 'test_scenario',
        });
      });
    });
  });

  describe('accessibility', () => {
    test('button is keyboard accessible', () => {
      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      expect(button.tagName).toBe('BUTTON');
    });

    test('has descriptive title for screen readers', () => {
      render(<ExportButton {...defaultProps} />);

      const button = screen.getByRole('button');
      const title = button.getAttribute('title');
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });

    test('disabled state is properly conveyed', () => {
      render(<ExportButton {...defaultProps} disabled={true} />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('disabled');
    });
  });
});
