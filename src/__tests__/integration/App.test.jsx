// src/__tests__/integration/App.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock dependencies BEFORE importing modules that use them
jest.mock('maplibre-gl', () => ({
  __esModule: true,
  default: {
    Map: jest.fn(() => ({
      on: jest.fn(),
      remove: jest.fn(),
      getLayer: jest.fn(),
      setPaintProperty: jest.fn(),
      getBounds: jest.fn(() => ({
        getWest: () => 16.45,
        getSouth: () => -34.85,
        getEast: () => 32.89,
        getNorth: () => -22.13,
      })),
      fitBounds: jest.fn(),
      setFilter: jest.fn(),
    })),
    Popup: jest.fn(() => ({
      setLngLat: jest.fn().mockReturnThis(),
      setHTML: jest.fn().mockReturnThis(),
      addTo: jest.fn().mockReturnThis(),
      remove: jest.fn(),
    })),
  },
}));
jest.mock('../../lib/api');

// Mock the MLMap component to avoid real MapLibre usage and emit a stable bbox
jest.mock('../../components/map/MLMap', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function MLMapStub({ onViewChange }) {
      React.useEffect(() => {
        if (onViewChange) {
          onViewChange(
            '16.4500000,-34.8500000,32.8900000,-22.1300000',
            {
              getBounds: () => ({
                getWest: () => 16.45,
                getSouth: () => -34.85,
                getEast: () => 32.89,
                getNorth: () => -22.13,
              }),
            }
          );
        }
      }, [onViewChange]);
      return React.createElement('div', { 'data-testid': 'map-stub' });
    },
  };
});

import App from '../../app/App';
import api from '../../lib/api';

describe('App Integration Tests', () => {
  const mockPeriods = [
    { period: '2024', label: '2024' },
    { period: '2023', label: '2023' },
  ];

  const mockThemes = [
    'Aggravated robbery',
    'Contact crimes',
  ];

  const mockIndicators = [
    { key: 'crime_carjacking', label: 'Carjacking' },
    { key: 'crime_robbery_res', label: 'Robbery at residential premises' },
  ];

  const mockChoroplethData = {
    label: 'Carjacking',
    unit: 'cases (raw count)',
    description: 'Motor vehicle hijacking (carjacking).',
    source_name: 'South African Police Service (SAPS)',
    source_url: 'https://www.saps.gov.za/services/crimestats.php',
    items: [
      { code: 'CPT', value: 123 },
      { code: 'JHB', value: 456 },
    ],
  };

  const mockMunicipalities = [
    { code: 'CPT', name: 'City of Cape Town', bbox: [18.307, -34.358, 19.004, -33.471] },
    { code: 'JHB', name: 'City of Johannesburg', bbox: [27.738, -26.416, 28.253, -25.954] },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default API mocks
    api.getPeriods.mockResolvedValue(mockPeriods);
    api.getThemes.mockResolvedValue(mockThemes);
    api.getIndicators.mockResolvedValue(mockIndicators);
    api.getChoropleth.mockResolvedValue(mockChoroplethData);
    api.getMunicipalities.mockResolvedValue(mockMunicipalities);
  });

  describe('Application Rendering', () => {
    test('renders main application structure', async () => {
      render(<App />);

      // Header
      expect(screen.getByText(/SA Risk.*Indicator Viewer/i)).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(api.getPeriods).toHaveBeenCalled();
      });
    });

    test('renders all main components', async () => {
      render(<App />);

      await waitFor(() => {
        // Controls should be present
        expect(screen.getByLabelText('Period')).toBeInTheDocument();
        expect(screen.getByLabelText('Measure')).toBeInTheDocument();
        expect(screen.getByLabelText('Theme')).toBeInTheDocument();
        expect(screen.getByLabelText('Indicator')).toBeInTheDocument();

        // Export button
        expect(screen.getByRole('button', { name: /Export shapefile/i })).toBeInTheDocument();

        // Municipality search
        expect(screen.getByLabelText('Municipality search')).toBeInTheDocument();

        // Legend
        expect(screen.getByText('Legend (log scale)')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading Flow', () => {
    test('loads periods on mount', async () => {
      render(<App />);

      await waitFor(() => {
        expect(api.getPeriods).toHaveBeenCalledTimes(1);
      });
    });

    test('automatically selects first period', async () => {
      render(<App />);

      await waitFor(() => {
        const periodSelect = screen.getByLabelText('Period');
        expect(periodSelect).toHaveValue('2024');
      });
    });

    test('loads themes when period is selected', async () => {
      render(<App />);

      await waitFor(() => {
        expect(api.getThemes).toHaveBeenCalledWith(
          expect.objectContaining({
            kind: 'indicator',
            period: '2024',
          })
        );
      });
    });

    test('loads indicators when theme is selected', async () => {
      render(<App />);

      await waitFor(() => {
        expect(api.getIndicators).toHaveBeenCalled();
      });
    });

    test('loads choropleth data when indicator is selected', async () => {
      render(<App />);

      await waitFor(() => {
        expect(api.getChoropleth).toHaveBeenCalled();
      });
    });
  });

  describe('User Interactions', () => {
    test('changing period triggers theme reload', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Period')).toHaveValue('2024');
      });

      const periodSelect = screen.getByLabelText('Period');
      fireEvent.change(periodSelect, { target: { value: '2023' } });

      await waitFor(() => {
        expect(api.getThemes).toHaveBeenCalledWith(
          expect.objectContaining({
            period: '2023',
          })
        );
      });
    });

    test('changing measure to sub_index updates theme options', async () => {
      api.getThemes.mockResolvedValueOnce(['Theme 1', 'Theme 2']); // sub_index themes

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Measure')).toBeInTheDocument();
      });

      const measureSelect = screen.getByLabelText('Measure');
      fireEvent.change(measureSelect, { target: { value: 'sub_index' } });

      await waitFor(() => {
        expect(api.getThemes).toHaveBeenCalledWith(
          expect.objectContaining({
            kind: 'sub_index',
          })
        );
      });
    });

    test('changing theme triggers indicator reload', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Theme')).not.toBeDisabled();
      });

      const themeSelect = screen.getByLabelText('Theme');
      fireEvent.change(themeSelect, { target: { value: 'Contact crimes' } });

      await waitFor(() => {
        expect(api.getIndicators).toHaveBeenCalledWith(
          expect.objectContaining({
            theme: 'Contact crimes',
          })
        );
      });
    });

    test('changing indicator triggers choropleth reload', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Indicator')).not.toBeDisabled();
      });

      const indicatorSelect = screen.getByLabelText('Indicator');
      fireEvent.change(indicatorSelect, { target: { value: 'crime_robbery_res' } });

      await waitFor(() => {
        expect(api.getChoropleth).toHaveBeenCalledWith(
          'crime_robbery_res',
          expect.any(Object)
        );
      });
    });
  });

  describe('Details Panel Integration', () => {
    test('displays indicator metadata', async () => {
      render(<App />);

      await waitFor(() => {
        const labelMatches = screen.getAllByText('Carjacking');
        expect(labelMatches.length).toBeGreaterThan(0);
        expect(screen.getByText('cases (raw count)')).toBeInTheDocument();
        expect(screen.getByText(/Motor vehicle hijacking/)).toBeInTheDocument();
        expect(screen.getByText('South African Police Service (SAPS)')).toBeInTheDocument();
      });
    });

    test('displays selected period in details', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Period: 2024/)).toBeInTheDocument();
      });
    });

    test('updates details when indicator changes', async () => {
      const newChoroplethData = {
        ...mockChoroplethData,
        label: 'Robbery at residential premises',
        description: 'Robbery at residential premises.',
      };

      api.getChoropleth.mockResolvedValueOnce(newChoroplethData);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Indicator')).not.toBeDisabled();
      });

      const indicatorSelect = screen.getByLabelText('Indicator');
      fireEvent.change(indicatorSelect, { target: { value: 'crime_robbery_res' } });

      await waitFor(() => {
        expect(screen.getByText('Robbery at residential premises')).toBeInTheDocument();
      });
    });
  });

  describe('Legend Integration', () => {
    test('renders legend with data', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Legend (log scale)')).toBeInTheDocument();
      });
    });

    test('toggles reverse colors', async () => {
      render(<App />);

      await waitFor(() => {
        const reverseCheckbox = screen.getByLabelText('Reverse colours');
        expect(reverseCheckbox).not.toBeChecked();

        fireEvent.click(reverseCheckbox);

        expect(reverseCheckbox).toBeChecked();
      });
    });

    test('toggles fix across periods', async () => {
      render(<App />);

      await waitFor(() => {
        const fixCheckbox = screen.getByLabelText('Use the same min/max across all periods');
        expect(fixCheckbox).not.toBeChecked();

        fireEvent.click(fixCheckbox);

        expect(fixCheckbox).toBeChecked();
      });
    });
  });

  describe('Export Integration', () => {
    test('export button is disabled when no indicator selected', async () => {
      api.getIndicators.mockResolvedValueOnce([]);

      render(<App />);

      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /Export shapefile/i });
        expect(exportButton).toBeDisabled();
      });
    });

    test('export button is enabled when indicator selected', async () => {
      render(<App />);

      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /Export shapefile/i });
        expect(exportButton).not.toBeDisabled();
      });
    });
  });

  describe('Municipality Search Integration', () => {
    test('municipality search loads data', async () => {
      render(<App />);

      await waitFor(() => {
        expect(api.getMunicipalities).toHaveBeenCalled();
      });
    });

    test('searching for municipality shows results', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Type municipality name or code…')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(searchInput, { target: { value: 'Cape' } });

      await waitFor(() => {
        expect(screen.getByText('City of Cape Town')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles period loading error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      api.getPeriods.mockRejectedValueOnce(new Error('API Error'));

      render(<App />);

      await waitFor(() => {
        // App should still render
        expect(screen.getByText(/SA Risk.*Indicator Viewer/i)).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    test('handles theme loading error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      api.getThemes.mockRejectedValueOnce(new Error('API Error'));

      render(<App />);

      await waitFor(() => {
        // Controls should still be present
        expect(screen.getByLabelText('Theme')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    test('handles choropleth loading error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      api.getChoropleth.mockRejectedValueOnce(new Error('API Error'));

      render(<App />);

      await waitFor(() => {
        // App should still render
        expect(screen.getByText(/SA Risk.*Indicator Viewer/i)).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    test('has semantic HTML structure', async () => {
      const { container } = render(<App />);

      await waitFor(() => {
        expect(container.querySelector('header')).toBeInTheDocument();
        expect(container.querySelector('main')).toBeInTheDocument();
      });
    });

    test('all form controls have labels', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByLabelText('Period')).toBeInTheDocument();
        expect(screen.getByLabelText('Measure')).toBeInTheDocument();
        expect(screen.getByLabelText('Theme')).toBeInTheDocument();
        expect(screen.getByLabelText('Indicator')).toBeInTheDocument();
        expect(screen.getByLabelText('Municipality search')).toBeInTheDocument();
      });
    });
  });

  describe('Complete User Workflow', () => {
    test('complete workflow: select period -> theme -> indicator -> view data', async () => {
      render(<App />);

      // 1. Wait for initial load
      await waitFor(() => {
        expect(api.getPeriods).toHaveBeenCalled();
      });

      // 2. Period should be auto-selected
      const periodSelect = screen.getByLabelText('Period');
      expect(periodSelect).toHaveValue('2024');

      // 3. Change period
      fireEvent.change(periodSelect, { target: { value: '2023' } });

      await waitFor(() => {
        expect(api.getThemes).toHaveBeenCalledWith(
          expect.objectContaining({ period: '2023' })
        );
      });

      // 4. Select theme
      const themeSelect = screen.getByLabelText('Theme');
      fireEvent.change(themeSelect, { target: { value: 'Contact crimes' } });

      await waitFor(() => {
        expect(api.getIndicators).toHaveBeenCalledWith(
          expect.objectContaining({ theme: 'Contact crimes' })
        );
      });

      // 5. Select indicator
      const indicatorSelect = screen.getByLabelText('Indicator');
      fireEvent.change(indicatorSelect, { target: { value: 'crime_robbery_res' } });

      await waitFor(() => {
        expect(api.getChoropleth).toHaveBeenCalledWith(
          'crime_robbery_res',
          expect.objectContaining({ period: '2023' })
        );
      });

      // 6. Verify details panel shows data
      expect(screen.getByText(/Period: 2023/)).toBeInTheDocument();
    });
  });
});
