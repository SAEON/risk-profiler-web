// src/__tests__/components/Controls.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Controls from '../../components/toolbar/Controls';

describe('Controls Component', () => {
  // Mock data
  const mockPeriods = [
    { period: '2024', label: '2024' },
    { period: '2023', label: '2023' },
    { period: '2022', label: '2022' },
  ];

  const mockThemes = [
    'Aggravated robbery',
    'Contact crimes',
    'Property-related crimes',
  ];

  const mockIndicators = [
    { key: 'crime_carjacking', label: 'Carjacking' },
    { key: 'crime_robbery_res', label: 'Robbery at residential premises' },
    { key: 'crime_truck_hijacking', label: 'Truck hijacking' },
  ];

  const defaultProps = {
    periods: mockPeriods,
    themes: mockThemes,
    indicators: mockIndicators,
    period: '2024',
    measure: 'indicator',
    theme: 'Aggravated robbery',
    indicator: 'crime_carjacking',
    hasSubIndexForPeriod: true,
    onChangePeriod: jest.fn(),
    onChangeMeasure: jest.fn(),
    onChangeTheme: jest.fn(),
    onChangeIndicator: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders all four select controls', () => {
      render(<Controls {...defaultProps} />);

      expect(screen.getByLabelText('Period')).toBeInTheDocument();
      expect(screen.getByLabelText('Measure')).toBeInTheDocument();
      expect(screen.getByLabelText('Theme')).toBeInTheDocument();
      expect(screen.getByLabelText('Indicator')).toBeInTheDocument();
    });

    test('renders with correct aria-label', () => {
      render(<Controls {...defaultProps} />);

      const toolbar = screen.getByLabelText('Indicator Controls');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveClass('toolbar', 'toolbar--controls');
    });

    test('renders period options correctly', () => {
      render(<Controls {...defaultProps} />);

      const periodSelect = screen.getByLabelText('Period');

      // Check for "Select..." options (there are multiple, one per select)
      const selectOptions = screen.getAllByRole('option', { name: 'Select…' });
      expect(selectOptions.length).toBeGreaterThan(0);

      // Check for period options
      mockPeriods.forEach(p => {
        expect(screen.getByRole('option', { name: p.label })).toBeInTheDocument();
      });
    });

    test('renders theme options correctly', () => {
      render(<Controls {...defaultProps} />);

      const themeSelect = screen.getByLabelText('Theme');

      mockThemes.forEach(theme => {
        expect(screen.getByRole('option', { name: theme })).toBeInTheDocument();
      });
    });

    test('renders indicator options correctly', () => {
      render(<Controls {...defaultProps} />);

      mockIndicators.forEach(ind => {
        expect(screen.getByRole('option', { name: ind.label })).toBeInTheDocument();
      });
    });

    test('uses period value when label is not provided', () => {
      const periodsWithoutLabels = [
        { period: '2024' },
        { period: '2023' },
      ];

      render(<Controls {...defaultProps} periods={periodsWithoutLabels} />);

      expect(screen.getByRole('option', { name: '2024' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '2023' })).toBeInTheDocument();
    });

    test('uses indicator key when label is not provided', () => {
      const indicatorsWithoutLabels = [
        { key: 'crime_test' },
        { key: 'crime_test2' },
      ];

      render(<Controls {...defaultProps} indicators={indicatorsWithoutLabels} />);

      expect(screen.getByRole('option', { name: 'crime_test' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'crime_test2' })).toBeInTheDocument();
    });
  });

  describe('selected values', () => {
    test('displays selected period value', () => {
      render(<Controls {...defaultProps} period="2023" />);

      const periodSelect = screen.getByLabelText('Period');
      expect(periodSelect).toHaveValue('2023');
    });

    test('displays selected measure value', () => {
      render(<Controls {...defaultProps} measure="sub_index" />);

      const measureSelect = screen.getByLabelText('Measure');
      expect(measureSelect).toHaveValue('sub_index');
    });

    test('displays selected theme value', () => {
      render(<Controls {...defaultProps} theme="Contact crimes" />);

      const themeSelect = screen.getByLabelText('Theme');
      expect(themeSelect).toHaveValue('Contact crimes');
    });

    test('displays selected indicator value', () => {
      render(<Controls {...defaultProps} indicator="crime_robbery_res" />);

      const indicatorSelect = screen.getByLabelText('Indicator');
      expect(indicatorSelect).toHaveValue('crime_robbery_res');
    });

    test('handles empty string for period', () => {
      render(<Controls {...defaultProps} period="" />);

      const periodSelect = screen.getByLabelText('Period');
      expect(periodSelect).toHaveValue('');
    });

    test('handles null period value', () => {
      render(<Controls {...defaultProps} period={null} />);

      const periodSelect = screen.getByLabelText('Period');
      expect(periodSelect).toHaveValue('');
    });
  });

  describe('user interactions', () => {
    test('calls onChangePeriod when period is changed', () => {
      render(<Controls {...defaultProps} />);

      const periodSelect = screen.getByLabelText('Period');
      fireEvent.change(periodSelect, { target: { value: '2023' } });

      expect(defaultProps.onChangePeriod).toHaveBeenCalledTimes(1);
      expect(defaultProps.onChangePeriod).toHaveBeenCalledWith('2023');
    });

    test('calls onChangeMeasure when measure is changed', () => {
      render(<Controls {...defaultProps} />);

      const measureSelect = screen.getByLabelText('Measure');
      fireEvent.change(measureSelect, { target: { value: 'sub_index' } });

      expect(defaultProps.onChangeMeasure).toHaveBeenCalledTimes(1);
      expect(defaultProps.onChangeMeasure).toHaveBeenCalledWith('sub_index');
    });

    test('calls onChangeTheme when theme is changed', () => {
      render(<Controls {...defaultProps} />);

      const themeSelect = screen.getByLabelText('Theme');
      fireEvent.change(themeSelect, { target: { value: 'Contact crimes' } });

      expect(defaultProps.onChangeTheme).toHaveBeenCalledTimes(1);
      expect(defaultProps.onChangeTheme).toHaveBeenCalledWith('Contact crimes');
    });

    test('calls onChangeIndicator when indicator is changed', () => {
      render(<Controls {...defaultProps} />);

      const indicatorSelect = screen.getByLabelText('Indicator');
      fireEvent.change(indicatorSelect, { target: { value: 'crime_robbery_res' } });

      expect(defaultProps.onChangeIndicator).toHaveBeenCalledTimes(1);
      expect(defaultProps.onChangeIndicator).toHaveBeenCalledWith('crime_robbery_res');
    });

    test('passes empty string when select is cleared', () => {
      render(<Controls {...defaultProps} />);

      const themeSelect = screen.getByLabelText('Theme');
      fireEvent.change(themeSelect, { target: { value: '' } });

      expect(defaultProps.onChangeTheme).toHaveBeenCalledWith('');
    });

    test('defaults to "indicator" when measure value is empty', () => {
      render(<Controls {...defaultProps} />);

      const measureSelect = screen.getByLabelText('Measure');
      fireEvent.change(measureSelect, { target: { value: '' } });

      expect(defaultProps.onChangeMeasure).toHaveBeenCalledWith('indicator');
    });
  });

  describe('measure options', () => {
    test('renders all three measure options', () => {
      render(<Controls {...defaultProps} />);

      expect(screen.getByRole('option', { name: 'Indicator' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /Sub-index/ })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Index' })).toBeInTheDocument();
    });

    test('sub-index is enabled when hasSubIndexForPeriod is true', () => {
      render(<Controls {...defaultProps} hasSubIndexForPeriod={true} />);

      const subIndexOption = screen.getByRole('option', { name: 'Sub-index' });
      expect(subIndexOption).not.toBeDisabled();
    });

    test('sub-index is disabled when hasSubIndexForPeriod is false', () => {
      render(<Controls {...defaultProps} hasSubIndexForPeriod={false} />);

      const subIndexOption = screen.getByRole('option', { name: /Sub-index.*unavailable/ });
      expect(subIndexOption).toBeDisabled();
    });

    test('displays "(unavailable)" text when sub-index is disabled', () => {
      render(<Controls {...defaultProps} hasSubIndexForPeriod={false} />);

      expect(screen.getByRole('option', { name: 'Sub-index (unavailable)' })).toBeInTheDocument();
    });

    test('index option is always disabled', () => {
      render(<Controls {...defaultProps} />);

      const indexOption = screen.getByRole('option', { name: 'Index' });
      expect(indexOption).toBeDisabled();
    });
  });

  describe('disabled states', () => {
    test('theme select is disabled when no period is selected', () => {
      render(<Controls {...defaultProps} period="" />);

      const themeSelect = screen.getByLabelText('Theme');
      expect(themeSelect).toBeDisabled();
    });

    test('theme select is disabled when measure is index', () => {
      render(<Controls {...defaultProps} measure="index" />);

      const themeSelect = screen.getByLabelText('Theme');
      expect(themeSelect).toBeDisabled();
    });

    test('theme select is disabled when themes array is empty', () => {
      render(<Controls {...defaultProps} themes={[]} />);

      const themeSelect = screen.getByLabelText('Theme');
      expect(themeSelect).toBeDisabled();
    });

    test('theme select is enabled when all conditions are met', () => {
      render(<Controls {...defaultProps} period="2024" measure="indicator" themes={mockThemes} />);

      const themeSelect = screen.getByLabelText('Theme');
      expect(themeSelect).not.toBeDisabled();
    });

    test('indicator select is disabled when no period is selected', () => {
      render(<Controls {...defaultProps} period="" />);

      const indicatorSelect = screen.getByLabelText('Indicator');
      expect(indicatorSelect).toBeDisabled();
    });

    test('indicator select is disabled when measure is index', () => {
      render(<Controls {...defaultProps} measure="index" />);

      const indicatorSelect = screen.getByLabelText('Indicator');
      expect(indicatorSelect).toBeDisabled();
    });

    test('indicator select is disabled when no theme is selected', () => {
      render(<Controls {...defaultProps} theme="" />);

      const indicatorSelect = screen.getByLabelText('Indicator');
      expect(indicatorSelect).toBeDisabled();
    });

    test('indicator select is disabled when indicators array is empty', () => {
      render(<Controls {...defaultProps} indicators={[]} />);

      const indicatorSelect = screen.getByLabelText('Indicator');
      expect(indicatorSelect).toBeDisabled();
    });

    test('indicator select is enabled when all conditions are met', () => {
      render(<Controls {...defaultProps} period="2024" measure="indicator" theme="Test" indicators={mockIndicators} />);

      const indicatorSelect = screen.getByLabelText('Indicator');
      expect(indicatorSelect).not.toBeDisabled();
    });

    test('period select is never disabled', () => {
      render(<Controls {...defaultProps} />);

      const periodSelect = screen.getByLabelText('Period');
      expect(periodSelect).not.toBeDisabled();
    });

    test('measure select is never disabled', () => {
      render(<Controls {...defaultProps} />);

      const measureSelect = screen.getByLabelText('Measure');
      expect(measureSelect).not.toBeDisabled();
    });
  });

  describe('default props', () => {
    test('renders with empty arrays when no data provided', () => {
      render(<Controls />);

      const periodSelect = screen.getByLabelText('Period');
      const themeSelect = screen.getByLabelText('Theme');
      const indicatorSelect = screen.getByLabelText('Indicator');

      // Should only have the "Select..." option
      expect(periodSelect.options).toHaveLength(1);
      expect(themeSelect.options).toHaveLength(1);
      expect(indicatorSelect.options).toHaveLength(1);
    });

    test('uses default measure value "indicator"', () => {
      render(<Controls />);

      const measureSelect = screen.getByLabelText('Measure');
      expect(measureSelect).toHaveValue('indicator');
    });

    test('handles missing callback props gracefully', () => {
      render(<Controls {...defaultProps}
        onChangePeriod={undefined}
        onChangeMeasure={undefined}
        onChangeTheme={undefined}
        onChangeIndicator={undefined}
      />);

      const periodSelect = screen.getByLabelText('Period');

      // Should not throw error
      expect(() => {
        fireEvent.change(periodSelect, { target: { value: '2023' } });
      }).not.toThrow();
    });
  });

  describe('React.memo optimization', () => {
    test('component is wrapped with React.memo', () => {
      // Controls is exported as a memoized component
      // Check if it has the memo wrapper signature
      expect(Controls.$$typeof.toString()).toContain('react.memo');
    });
  });

  describe('edge cases', () => {
    test('handles period with numeric value', () => {
      const periodsNumeric = [
        { period: 2024, label: '2024' },
        { period: 2023, label: '2023' },
      ];

      render(<Controls {...defaultProps} periods={periodsNumeric} period={2024} />);

      const periodSelect = screen.getByLabelText('Period');
      expect(periodSelect).toHaveValue('2024');
    });

    test('renders correctly with single item in each array', () => {
      render(<Controls
        {...defaultProps}
        periods={[{ period: '2024', label: '2024' }]}
        themes={['Single Theme']}
        indicators={[{ key: 'single', label: 'Single Indicator' }]}
      />);

      expect(screen.getByRole('option', { name: '2024' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Single Theme' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Single Indicator' })).toBeInTheDocument();
    });

    test('handles special characters in theme names', () => {
      const themesWithSpecialChars = [
        'Theme & Special',
        'Theme <test>',
        "Theme's \"quoted\"",
      ];

      render(<Controls {...defaultProps} themes={themesWithSpecialChars} />);

      themesWithSpecialChars.forEach(theme => {
        expect(screen.getByRole('option', { name: theme })).toBeInTheDocument();
      });
    });

    test('handles long indicator labels', () => {
      const longLabel = 'This is a very long indicator label that might wrap or truncate';
      const indicatorsWithLongLabel = [
        { key: 'test', label: longLabel },
      ];

      render(<Controls {...defaultProps} indicators={indicatorsWithLongLabel} />);

      expect(screen.getByRole('option', { name: longLabel })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('all selects have proper id attributes', () => {
      render(<Controls {...defaultProps} />);

      expect(screen.getByLabelText('Period')).toHaveAttribute('id', 'period-select');
      expect(screen.getByLabelText('Measure')).toHaveAttribute('id', 'measure-select');
      expect(screen.getByLabelText('Theme')).toHaveAttribute('id', 'theme-select');
      expect(screen.getByLabelText('Indicator')).toHaveAttribute('id', 'indicator-select');
    });

    test('all selects have associated labels', () => {
      render(<Controls {...defaultProps} />);

      const periodSelect = screen.getByLabelText('Period');
      const measureSelect = screen.getByLabelText('Measure');
      const themeSelect = screen.getByLabelText('Theme');
      const indicatorSelect = screen.getByLabelText('Indicator');

      expect(periodSelect).toBeInTheDocument();
      expect(measureSelect).toBeInTheDocument();
      expect(themeSelect).toBeInTheDocument();
      expect(indicatorSelect).toBeInTheDocument();
    });

    test('applies nice-select class to all selects', () => {
      render(<Controls {...defaultProps} />);

      const selects = screen.getAllByRole('combobox');
      selects.forEach(select => {
        expect(select).toHaveClass('nice-select');
      });
    });

    test('disabled selects are properly marked', () => {
      render(<Controls {...defaultProps} period="" theme="" />);

      const themeSelect = screen.getByLabelText('Theme');
      const indicatorSelect = screen.getByLabelText('Indicator');

      expect(themeSelect).toHaveAttribute('disabled');
      expect(indicatorSelect).toHaveAttribute('disabled');
    });
  });
});
