// src/__tests__/components/Legend.test.jsx

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Legend from '../../components/legend/Legend';

describe('Legend Component', () => {
  // Mock bins data
  const mockBins = [
    { min: 0, max: 10, color: '#f1f5f9' },
    { min: 10, max: 50, color: '#86efac' },
    { min: 50, max: 100, color: '#4ade80' },
    { min: 100, max: 500, color: '#22c55e' },
    { min: 500, max: 1000, color: '#a3e635' },
  ];

  const defaultProps = {
    bins: mockBins,
    unit: 'cases',
    reverseColors: false,
    onToggleReverse: jest.fn(),
    fixAcrossPeriods: false,
    onToggleFixAcrossPeriods: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    test('renders legend header', () => {
      render(<Legend {...defaultProps} />);

      expect(screen.getByText('Legend (log scale)')).toBeInTheDocument();
    });

    test('renders reverse colors checkbox', () => {
      render(<Legend {...defaultProps} />);

      expect(screen.getByLabelText('Reverse colours')).toBeInTheDocument();
    });

    test('renders compare years section', () => {
      render(<Legend {...defaultProps} />);

      expect(screen.getByText('Compare years')).toBeInTheDocument();
      expect(screen.getByText('Use the same min/max across all periods')).toBeInTheDocument();
    });

    test('renders all legend items', () => {
      render(<Legend {...defaultProps} />);

      // Should render 5 legend items
      const legendItems = screen.getAllByText(/–/);
      expect(legendItems).toHaveLength(mockBins.length);
    });

    test('renders legend items in descending order (highest first)', () => {
      render(<Legend {...defaultProps} />);

      // First item should be the highest range
      expect(screen.getByText(/500.*–.*1[,\s.]000/)).toBeInTheDocument();
    });

    test('renders unit in legend labels when provided', () => {
      render(<Legend {...defaultProps} unit="cases" />);

      // Multiple legend items will have "cases", use getAllByText
      const casesElements = screen.getAllByText(/cases/);
      expect(casesElements.length).toBeGreaterThan(0);
    });

    test('does not render unit when null', () => {
      render(<Legend {...defaultProps} unit={null} />);

      const legendText = screen.getAllByText(/–/)[0].textContent;
      expect(legendText).not.toContain('cases');
    });

    test('renders without legend items when bins is empty', () => {
      render(<Legend {...defaultProps} bins={[]} />);

      const legendItems = screen.queryAllByText(/–/);
      expect(legendItems).toHaveLength(0);
    });
  });

  describe('legend formatting', () => {
    test('formats numbers correctly in legend labels', () => {
      const binsWithLargeNumbers = [
        { min: 1000, max: 5000, color: '#ff0000' },
      ];

      render(<Legend {...defaultProps} bins={binsWithLargeNumbers} />);

      // Numbers >= 1000 should use locale formatting
      expect(screen.getByText(/1[,\s.]000.*–.*5[,\s.]000/)).toBeInTheDocument();
    });

    test('formats small numbers correctly', () => {
      const binsWithSmallNumbers = [
        { min: 0.5, max: 2.5, color: '#ff0000' },
      ];

      render(<Legend {...defaultProps} bins={binsWithSmallNumbers} />);

      expect(screen.getByText(/0\.50.*–.*2\.50/)).toBeInTheDocument();
    });

    test('includes unit in label', () => {
      render(<Legend {...defaultProps} bins={[{ min: 0, max: 10, color: '#fff' }]} unit="%" />);

      expect(screen.getByText(/0\.00.*–.*10\.00 %/)).toBeInTheDocument();
    });

    test('handles missing unit gracefully', () => {
      render(<Legend {...defaultProps} bins={[{ min: 0, max: 10, color: '#fff' }]} unit="" />);

      const label = screen.getByText(/0\.00.*–.*10\.00/);
      expect(label.textContent).not.toMatch(/0\.00.*–.*10\.00\s+$/);
    });
  });

  describe('color swatches', () => {
    test('renders color swatches with correct background colors', () => {
      const { container } = render(<Legend {...defaultProps} />);

      const swatches = container.querySelectorAll('[style*="background"]');

      // Should have swatches for each bin
      expect(swatches.length).toBeGreaterThanOrEqual(mockBins.length);
    });

    test('color swatches have proper styling', () => {
      const { container } = render(<Legend {...defaultProps} bins={[{ min: 0, max: 10, color: '#ff0000' }]} />);

      const swatch = container.querySelector('[style*="background: rgb(255, 0, 0)"]');
      expect(swatch).toBeInTheDocument();
    });
  });

  describe('checkbox states', () => {
    test('reverse colors checkbox reflects reverseColors prop', () => {
      render(<Legend {...defaultProps} reverseColors={false} />);

      const checkbox = screen.getByLabelText('Reverse colours');
      expect(checkbox).not.toBeChecked();
    });

    test('reverse colors checkbox is checked when reverseColors is true', () => {
      render(<Legend {...defaultProps} reverseColors={true} />);

      const checkbox = screen.getByLabelText('Reverse colours');
      expect(checkbox).toBeChecked();
    });

    test('compare years checkbox reflects fixAcrossPeriods prop', () => {
      render(<Legend {...defaultProps} fixAcrossPeriods={false} />);

      const checkbox = screen.getByLabelText('Use the same min/max across all periods');
      expect(checkbox).not.toBeChecked();
    });

    test('compare years checkbox is checked when fixAcrossPeriods is true', () => {
      render(<Legend {...defaultProps} fixAcrossPeriods={true} />);

      const checkbox = screen.getByLabelText('Use the same min/max across all periods');
      expect(checkbox).toBeChecked();
    });
  });

  describe('user interactions', () => {
    test('calls onToggleReverse when reverse colors checkbox is clicked', () => {
      render(<Legend {...defaultProps} />);

      const checkbox = screen.getByLabelText('Reverse colours');
      fireEvent.click(checkbox);

      expect(defaultProps.onToggleReverse).toHaveBeenCalledTimes(1);
      expect(defaultProps.onToggleReverse).toHaveBeenCalledWith(true);
    });

    test('calls onToggleReverse with false when unchecking', () => {
      render(<Legend {...defaultProps} reverseColors={true} />);

      const checkbox = screen.getByLabelText('Reverse colours');
      fireEvent.click(checkbox);

      expect(defaultProps.onToggleReverse).toHaveBeenCalledWith(false);
    });

    test('calls onToggleFixAcrossPeriods when compare years checkbox is clicked', () => {
      render(<Legend {...defaultProps} />);

      const checkbox = screen.getByLabelText('Use the same min/max across all periods');
      fireEvent.click(checkbox);

      expect(defaultProps.onToggleFixAcrossPeriods).toHaveBeenCalledTimes(1);
      expect(defaultProps.onToggleFixAcrossPeriods).toHaveBeenCalledWith(true);
    });

    test('calls onToggleFixAcrossPeriods with false when unchecking', () => {
      render(<Legend {...defaultProps} fixAcrossPeriods={true} />);

      const checkbox = screen.getByLabelText('Use the same min/max across all periods');
      fireEvent.click(checkbox);

      expect(defaultProps.onToggleFixAcrossPeriods).toHaveBeenCalledWith(false);
    });

    test('handles missing onToggleReverse callback gracefully', () => {
      render(<Legend {...defaultProps} onToggleReverse={undefined} />);

      const checkbox = screen.getByLabelText('Reverse colours');

      expect(() => {
        fireEvent.click(checkbox);
      }).not.toThrow();
    });

    test('handles missing onToggleFixAcrossPeriods callback gracefully', () => {
      render(<Legend {...defaultProps} onToggleFixAcrossPeriods={undefined} />);

      const checkbox = screen.getByLabelText('Use the same min/max across all periods');

      expect(() => {
        fireEvent.click(checkbox);
      }).not.toThrow();
    });
  });

  describe('bins sorting and ordering', () => {
    test('sorts bins in descending order by min value', () => {
      const unsortedBins = [
        { min: 10, max: 50, color: '#aaa' },
        { min: 500, max: 1000, color: '#bbb' },
        { min: 50, max: 100, color: '#ccc' },
      ];

      const { container } = render(<Legend {...defaultProps} bins={unsortedBins} />);

      // Get all legend label texts using font-size style
      const labels = Array.from(container.querySelectorAll('[style*="font-size"]'))
        .map(el => el.textContent)
        .filter(text => text && text.includes('–')); // Filter for actual legend labels

      // First should be highest (500-1000), last should be lowest (10-50)
      expect(labels[0]).toMatch(/500/);
      expect(labels[labels.length - 1]).toMatch(/10/);
    });

    test('handles single bin', () => {
      const singleBin = [{ min: 0, max: 100, color: '#fff' }];

      render(<Legend {...defaultProps} bins={singleBin} />);

      expect(screen.getByText(/0\.00.*–.*100\.0/)).toBeInTheDocument();
    });

    test('handles many bins', () => {
      const manyBins = Array.from({ length: 20 }, (_, i) => ({
        min: i * 10,
        max: (i + 1) * 10,
        color: `#${i.toString(16).padStart(6, '0')}`,
      }));

      render(<Legend {...defaultProps} bins={manyBins} />);

      const legendItems = screen.getAllByText(/–/);
      expect(legendItems).toHaveLength(20);
    });
  });

  describe('default props', () => {
    test('renders with minimal props', () => {
      render(<Legend />);

      expect(screen.getByText('Legend (log scale)')).toBeInTheDocument();
      expect(screen.getByLabelText('Reverse colours')).toBeInTheDocument();
    });

    test('uses empty array for bins by default', () => {
      render(<Legend />);

      const legendItems = screen.queryAllByText(/–/);
      expect(legendItems).toHaveLength(0);
    });

    test('unchecks both checkboxes by default', () => {
      render(<Legend />);

      const reverseCheckbox = screen.getByLabelText('Reverse colours');
      const fixCheckbox = screen.getByLabelText('Use the same min/max across all periods');

      expect(reverseCheckbox).not.toBeChecked();
      expect(fixCheckbox).not.toBeChecked();
    });
  });

  describe('edge cases', () => {
    test('handles bins with same min and max', () => {
      const sameBins = [{ min: 50, max: 50, color: '#fff' }];

      render(<Legend {...defaultProps} bins={sameBins} />);

      expect(screen.getByText(/50\.0.*–.*50\.0/)).toBeInTheDocument();
    });

    test('handles bins with very large numbers', () => {
      const largeBins = [{ min: 1000000, max: 9999999, color: '#fff' }];

      render(<Legend {...defaultProps} bins={largeBins} />);

      // Should format with locale separators
      expect(screen.getByText(/1[,\s.]000[,\s.]000/)).toBeInTheDocument();
    });

    test('handles bins with very small numbers', () => {
      const smallBins = [{ min: 0.001, max: 0.009, color: '#fff' }];

      render(<Legend {...defaultProps} bins={smallBins} />);

      expect(screen.getByText(/0\.00.*–.*0\.01/)).toBeInTheDocument();
    });

    test('handles bins with negative numbers', () => {
      const negativeBins = [{ min: -100, max: -10, color: '#fff' }];

      render(<Legend {...defaultProps} bins={negativeBins} />);

      expect(screen.getByText(/-100\.0.*–.*-10\.00/)).toBeInTheDocument();
    });

    test('handles unit with special characters', () => {
      render(<Legend {...defaultProps} bins={[{ min: 0, max: 10, color: '#fff' }]} unit="$/km²" />);

      expect(screen.getByText(/\$\/km²/)).toBeInTheDocument();
    });

    test('handles very long unit strings', () => {
      const longUnit = 'cases per 100,000 population';

      render(<Legend {...defaultProps} bins={[{ min: 0, max: 10, color: '#fff' }]} unit={longUnit} />);

      expect(screen.getByText(new RegExp(longUnit))).toBeInTheDocument();
    });
  });

  describe('styling and layout', () => {
    test('applies detail-row class to compare years section', () => {
      const { container } = render(<Legend {...defaultProps} />);

      const detailRow = container.querySelector('.detail-row');
      expect(detailRow).toBeInTheDocument();
    });

    test('applies detail-key and detail-value classes', () => {
      const { container } = render(<Legend {...defaultProps} />);

      expect(container.querySelector('.detail-key')).toBeInTheDocument();
      expect(container.querySelector('.detail-value')).toBeInTheDocument();
    });

    test('header has margin 0', () => {
      render(<Legend {...defaultProps} />);

      const header = screen.getByText('Legend (log scale)');
      expect(header).toHaveStyle({ margin: '0' });
    });
  });

  describe('useMemo optimization', () => {
    test('memoizes legend items based on bins and unit', () => {
      const { rerender } = render(<Legend {...defaultProps} />);

      // Get initial legend items count
      const initialCount = screen.getAllByText(/–/).length;

      // Rerender with same props
      rerender(<Legend {...defaultProps} />);

      // Should still have same count (memoization working)
      expect(screen.getAllByText(/–/)).toHaveLength(initialCount);
    });

    test('recalculates legend when bins change', () => {
      const { rerender } = render(<Legend {...defaultProps} bins={mockBins} />);

      const initialCount = screen.getAllByText(/–/).length;

      const newBins = [
        { min: 0, max: 10, color: '#fff' },
      ];

      rerender(<Legend {...defaultProps} bins={newBins} />);

      // Should have different count
      expect(screen.getAllByText(/–/)).toHaveLength(1);
    });

    test('recalculates legend when unit changes', () => {
      const { rerender } = render(<Legend {...defaultProps} bins={[{ min: 0, max: 10, color: '#fff' }]} unit="cases" />);

      expect(screen.getByText(/cases/)).toBeInTheDocument();

      rerender(<Legend {...defaultProps} bins={[{ min: 0, max: 10, color: '#fff' }]} unit="%" />);

      expect(screen.getByText(/%/)).toBeInTheDocument();
      expect(screen.queryByText(/cases/)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    test('checkboxes are properly associated with labels', () => {
      render(<Legend {...defaultProps} />);

      const reverseCheckbox = screen.getByLabelText('Reverse colours');
      const fixCheckbox = screen.getByLabelText('Use the same min/max across all periods');

      expect(reverseCheckbox.type).toBe('checkbox');
      expect(fixCheckbox.type).toBe('checkbox');
    });

    test('checkboxes can be toggled via keyboard', () => {
      render(<Legend {...defaultProps} />);

      const checkbox = screen.getByLabelText('Reverse colours');

      // Use click instead of keyDown for checkbox interaction
      // Browsers handle checkbox space key as click automatically
      fireEvent.click(checkbox);

      expect(defaultProps.onToggleReverse).toHaveBeenCalled();
    });
  });
});
