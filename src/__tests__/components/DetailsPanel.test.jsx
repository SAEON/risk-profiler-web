// src/__tests__/components/DetailsPanel.test.jsx

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DetailsPanel from '../../components/details/DetailsPanel';

describe('DetailsPanel Component', () => {
  const mockMeta = {
    label: 'Carjacking',
    unit: 'cases (raw count)',
    description: 'Motor vehicle hijacking (carjacking).',
    source_name: 'South African Police Service (SAPS)',
    source_url: 'https://www.saps.gov.za/services/crimestats.php',
  };

  const defaultProps = {
    meta: mockMeta,
    period: '2024',
  };

  describe('rendering', () => {
    test('renders all detail sections', () => {
      render(<DetailsPanel {...defaultProps} />);

      expect(screen.getByText('Selected')).toBeInTheDocument();
      expect(screen.getByText('Units')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Source')).toBeInTheDocument();
    });

    test('renders label correctly', () => {
      render(<DetailsPanel {...defaultProps} />);

      expect(screen.getByText('Carjacking')).toBeInTheDocument();
    });

    test('renders period correctly', () => {
      render(<DetailsPanel {...defaultProps} />);

      expect(screen.getByText('Period: 2024')).toBeInTheDocument();
    });

    test('renders unit correctly', () => {
      render(<DetailsPanel {...defaultProps} />);

      expect(screen.getByText('cases (raw count)')).toBeInTheDocument();
    });

    test('renders description correctly', () => {
      render(<DetailsPanel {...defaultProps} />);

      expect(screen.getByText('Motor vehicle hijacking (carjacking).')).toBeInTheDocument();
    });

    test('renders source name correctly', () => {
      render(<DetailsPanel {...defaultProps} />);

      expect(screen.getByText('South African Police Service (SAPS)')).toBeInTheDocument();
    });

    test('renders source as link when URL is provided', () => {
      render(<DetailsPanel {...defaultProps} />);

      const link = screen.getByRole('link', { name: 'South African Police Service (SAPS)' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://www.saps.gov.za/services/crimestats.php');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('null/undefined handling', () => {
    test('returns null when meta is not provided', () => {
      const { container } = render(<DetailsPanel meta={null} period="2024" />);

      expect(container.firstChild).toBeNull();
    });

    test('returns null when meta is undefined', () => {
      const { container } = render(<DetailsPanel meta={undefined} period="2024" />);

      expect(container.firstChild).toBeNull();
    });

    test('renders with empty meta object', () => {
      const { container } = render(<DetailsPanel meta={{}} period="2024" />);

      expect(container.firstChild).not.toBeNull();
    });
  });

  describe('fallback values', () => {
    test('displays "—" when label is empty', () => {
      const metaWithoutLabel = { ...mockMeta, label: '' };
      render(<DetailsPanel meta={metaWithoutLabel} period="2024" />);

      const detailValues = screen.getAllByText('—');
      expect(detailValues.length).toBeGreaterThan(0);
    });

    test('displays "—" when unit is null', () => {
      const metaWithoutUnit = { ...mockMeta, unit: null };
      render(<DetailsPanel meta={metaWithoutUnit} period="2024" />);

      const unitsRow = screen.getByText('Units').parentElement;
      expect(unitsRow).toHaveTextContent('—');
    });

    test('displays "—" when description is empty', () => {
      const metaWithoutDescription = { ...mockMeta, description: '' };
      render(<DetailsPanel meta={metaWithoutDescription} period="2024" />);

      const descriptionRow = screen.getByText('Description').parentElement;
      expect(descriptionRow).toHaveTextContent('—');
    });

    test('displays "—" when source name and URL are empty', () => {
      const metaWithoutSource = { ...mockMeta, source_name: '', source_url: '' };
      render(<DetailsPanel meta={metaWithoutSource} period="2024" />);

      const sourceRow = screen.getByText('Source').parentElement;
      expect(sourceRow).toHaveTextContent('—');
    });

    test('displays source name without link when URL is empty', () => {
      const metaWithoutUrl = { ...mockMeta, source_url: '' };
      render(<DetailsPanel meta={metaWithoutUrl} period="2024" />);

      expect(screen.getByText('South African Police Service (SAPS)')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    test('displays URL as link text when source name is empty', () => {
      const metaWithoutName = { ...mockMeta, source_name: '' };
      render(<DetailsPanel meta={metaWithoutName} period="2024" />);

      const link = screen.getByRole('link', { name: 'https://www.saps.gov.za/services/crimestats.php' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveTextContent('https://www.saps.gov.za/services/crimestats.php');
    });

    test('does not display period text when period is empty', () => {
      render(<DetailsPanel meta={mockMeta} period="" />);

      expect(screen.queryByText(/Period:/)).not.toBeInTheDocument();
    });

    test('does not display period text when period is null', () => {
      render(<DetailsPanel meta={mockMeta} period={null} />);

      expect(screen.queryByText(/Period:/)).not.toBeInTheDocument();
    });
  });

  describe('period formatting', () => {
    test('displays period as string', () => {
      render(<DetailsPanel meta={mockMeta} period="2024" />);

      expect(screen.getByText('Period: 2024')).toBeInTheDocument();
    });

    test('displays period as number', () => {
      render(<DetailsPanel meta={mockMeta} period={2024} />);

      expect(screen.getByText('Period: 2024')).toBeInTheDocument();
    });

    test('displays multi-year period', () => {
      render(<DetailsPanel meta={mockMeta} period="2022-2024" />);

      expect(screen.getByText('Period: 2022-2024')).toBeInTheDocument();
    });
  });

  describe('source link attributes', () => {
    test('link opens in new tab', () => {
      render(<DetailsPanel {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    test('link has security attributes', () => {
      render(<DetailsPanel {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('link has title attribute with source name', () => {
      render(<DetailsPanel {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('title', 'South African Police Service (SAPS)');
    });

    test('link uses URL as title when source name is empty', () => {
      const metaWithoutName = { ...mockMeta, source_name: '' };
      render(<DetailsPanel meta={metaWithoutName} period="2024" />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('title', 'https://www.saps.gov.za/services/crimestats.php');
    });

    test('link has correct color styling', () => {
      render(<DetailsPanel {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveStyle({ color: '#0ea5e9' });
    });
  });

  describe('CSS classes', () => {
    test('applies detail-row class to all rows', () => {
      const { container } = render(<DetailsPanel {...defaultProps} />);

      const detailRows = container.querySelectorAll('.detail-row');
      expect(detailRows).toHaveLength(4); // Selected, Units, Description, Source
    });

    test('applies detail-key class to labels', () => {
      const { container } = render(<DetailsPanel {...defaultProps} />);

      const detailKeys = container.querySelectorAll('.detail-key');
      expect(detailKeys).toHaveLength(4);
    });

    test('applies detail-value class to values', () => {
      const { container } = render(<DetailsPanel {...defaultProps} />);

      const detailValues = container.querySelectorAll('.detail-value');
      expect(detailValues).toHaveLength(4);
    });
  });

  describe('styling', () => {
    test('label has bold font weight', () => {
      render(<DetailsPanel {...defaultProps} />);

      const label = screen.getByText('Carjacking');
      expect(label).toHaveStyle({ fontWeight: 600 });
    });

    test('period text has muted color and small font', () => {
      render(<DetailsPanel {...defaultProps} />);

      const periodText = screen.getByText('Period: 2024');
      expect(periodText).toHaveStyle({ color: '#64748b', fontSize: 12 });
    });
  });

  describe('edge cases', () => {
    test('handles very long label', () => {
      const metaWithLongLabel = {
        ...mockMeta,
        label: 'This is a very long indicator label that might wrap across multiple lines in the interface',
      };

      render(<DetailsPanel meta={metaWithLongLabel} period="2024" />);

      expect(screen.getByText(/This is a very long indicator label/)).toBeInTheDocument();
    });

    test('handles very long description', () => {
      const metaWithLongDescription = {
        ...mockMeta,
        description: 'This is a very long description that provides extensive detail about the indicator, including methodology, data collection processes, and various other important information that users need to know.',
      };

      render(<DetailsPanel meta={metaWithLongDescription} period="2024" />);

      expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
    });

    test('handles special characters in label', () => {
      const metaWithSpecialChars = {
        ...mockMeta,
        label: 'Crime & Safety: <Test> "Indicator"',
      };

      render(<DetailsPanel meta={metaWithSpecialChars} period="2024" />);

      expect(screen.getByText('Crime & Safety: <Test> "Indicator"')).toBeInTheDocument();
    });

    test('handles special characters in description', () => {
      const metaWithSpecialChars = {
        ...mockMeta,
        description: 'Includes "quoted" & <tagged> content',
      };

      render(<DetailsPanel meta={metaWithSpecialChars} period="2024" />);

      expect(screen.getByText('Includes "quoted" & <tagged> content')).toBeInTheDocument();
    });

    test('handles URL with query parameters', () => {
      const metaWithComplexUrl = {
        ...mockMeta,
        source_url: 'https://example.com/data?year=2024&type=crime',
      };

      render(<DetailsPanel meta={metaWithComplexUrl} period="2024" />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com/data?year=2024&type=crime');
    });

    test('handles missing meta properties', () => {
      const incompleteMeta = {
        label: 'Test Label',
        // unit, description, source_name, source_url are missing
      };

      render(<DetailsPanel meta={incompleteMeta} period="2024" />);

      expect(screen.getByText('Test Label')).toBeInTheDocument();
      expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    });
  });

  describe('React.memo optimization', () => {
    test('component is wrapped with React.memo', () => {
      expect(DetailsPanel.$$typeof.toString()).toContain('react.memo');
    });
  });

  describe('integration scenarios', () => {
    test('renders complete indicator information', () => {
      const completeIndicator = {
        label: 'Murder',
        unit: 'cases per 100,000 population',
        description: 'Number of murder cases reported per 100,000 population.',
        source_name: 'Stats SA',
        source_url: 'https://www.statssa.gov.za',
      };

      render(<DetailsPanel meta={completeIndicator} period="2023" />);

      expect(screen.getByText('Murder')).toBeInTheDocument();
      expect(screen.getByText('Period: 2023')).toBeInTheDocument();
      expect(screen.getByText('cases per 100,000 population')).toBeInTheDocument();
      expect(screen.getByText(/Number of murder cases/)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Stats SA' })).toBeInTheDocument();
    });

    test('renders minimal indicator information', () => {
      const minimalIndicator = {
        label: 'Unknown Indicator',
      };

      render(<DetailsPanel meta={minimalIndicator} period="2024" />);

      expect(screen.getByText('Unknown Indicator')).toBeInTheDocument();
      expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
    });

    test('renders with only source URL (no name)', () => {
      const urlOnlyMeta = {
        ...mockMeta,
        source_name: '',
        source_url: 'https://data.gov.za',
      };

      render(<DetailsPanel meta={urlOnlyMeta} period="2024" />);

      const link = screen.getByRole('link', { name: 'https://data.gov.za' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://data.gov.za');
    });
  });

  describe('accessibility', () => {
    test('link is keyboard accessible', () => {
      render(<DetailsPanel {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href');
      expect(link.tagName).toBe('A');
    });

    test('has semantic HTML structure', () => {
      const { container } = render(<DetailsPanel {...defaultProps} />);

      // Should have proper div structure
      const rows = container.querySelectorAll('.detail-row');
      rows.forEach(row => {
        expect(row.querySelector('.detail-key')).toBeInTheDocument();
        expect(row.querySelector('.detail-value')).toBeInTheDocument();
      });
    });

    test('link has descriptive title', () => {
      render(<DetailsPanel {...defaultProps} />);

      const link = screen.getByRole('link');
      const title = link.getAttribute('title');
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
    });
  });
});
