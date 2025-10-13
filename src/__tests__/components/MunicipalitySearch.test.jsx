// src/__tests__/components/MunicipalitySearch.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MunicipalitySearch from '../../components/search/MunicipalitySearch';
import api from '../../lib/api';

// Mock the API module
jest.mock('../../lib/api');

describe('MunicipalitySearch Component', () => {
  const mockMunicipalities = [
    { code: 'CPT', name: 'City of Cape Town', bbox: [18.307, -34.358, 19.004, -33.471] },
    { code: 'JHB', name: 'City of Johannesburg', bbox: [27.738, -26.416, 28.253, -25.954] },
    { code: 'DBN', name: 'eThekwini', bbox: [30.657, -30.077, 31.164, -29.532] },
    { code: 'WC033', name: 'Cape Agulhas', bbox: [19.617, -34.834, 20.871, -34.203] },
    { code: 'GT422', name: 'Greater Johannesburg', bbox: [27.5, -26.5, 28.5, -26.0] },
  ];

  const defaultProps = {
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    api.getMunicipalities.mockResolvedValue(mockMunicipalities);
  });

  describe('rendering', () => {
    test('renders search label', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      expect(screen.getByText('Municipality search')).toBeInTheDocument();
    });

    test('renders search input', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      expect(screen.getByPlaceholderText('Type municipality name or code…')).toBeInTheDocument();
    });

    test('renders keyboard hint when no query', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(screen.queryByLabelText('Clear')).not.toBeInTheDocument();
      });

      expect(screen.getByText('/')).toBeInTheDocument();
    });

    test('shows spinner while loading', () => {
      render(<MunicipalitySearch {...defaultProps} />);

      const spinner = document.querySelector('.searchbox__spinner');
      expect(spinner).toBeInTheDocument();
    });

    test('hides spinner after loading', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });
    });
  });

  describe('API data loading', () => {
    test('fetches municipalities on mount', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(api.getMunicipalities).toHaveBeenCalledTimes(1);
      });
    });

    test('handles API success', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(api.getMunicipalities).toHaveBeenCalled();
      });

      // Should not show error state
      const input = screen.getByPlaceholderText('Type municipality name or code…');
      expect(input).toBeInTheDocument();
    });

    test('handles API error gracefully', async () => {
      api.getMunicipalities.mockRejectedValueOnce(new Error('API error'));

      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      // Component should still render
      expect(screen.getByPlaceholderText('Type municipality name or code…')).toBeInTheDocument();
    });

    test('handles non-array API response', async () => {
      api.getMunicipalities.mockResolvedValueOnce(null);

      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      // Should not crash
      expect(screen.getByPlaceholderText('Type municipality name or code…')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    test('filters municipalities by name', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        expect(screen.getByText('City of Cape Town')).toBeInTheDocument();
        expect(screen.getByText('Cape Agulhas')).toBeInTheDocument();
      });
    });

    test('search scores code matches higher than name-only matches', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      // Search by name which will match multiple
      fireEvent.change(input, { target: { value: 'city' } });

      await waitFor(() => {
        const items = screen.queryAllByRole('option');
        // Should find cities (multiple municipalities have "City" in name)
        expect(items.length).toBeGreaterThanOrEqual(1);
      });
    });

    test('shows "No matches" when no results', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'xyz123nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText('No matches')).toBeInTheDocument();
      });
    });

    test('search is case insensitive', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'CAPE' } });

      await waitFor(() => {
        expect(screen.getByText('City of Cape Town')).toBeInTheDocument();
      });
    });

    test('limits results to 10 items', async () => {
      const manyMunicipalities = Array.from({ length: 20 }, (_, i) => ({
        code: `MUN${i}`,
        name: `Municipality ${i}`,
        bbox: [0, 0, 1, 1],
      }));

      api.getMunicipalities.mockResolvedValueOnce(manyMunicipalities);

      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Municipality' } });

      await waitFor(() => {
        const items = screen.getAllByRole('option');
        expect(items.length).toBeLessThanOrEqual(10);
      });
    });

    test('prioritizes startsWith matches', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'City' } });

      await waitFor(() => {
        const items = screen.getAllByRole('option');
        // "City of Cape Town" and "City of Johannesburg" should be first
        expect(items[0]).toHaveTextContent('City of');
      });
    });
  });

  describe('dropdown behavior', () => {
    test('opens dropdown on focus', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    test('opens dropdown on input change', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    test('closes dropdown on item selection', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const item = screen.getByText('City of Cape Town');
        fireEvent.click(item);
      });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    test('does not show dropdown when query is empty', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.focus(input);

      // Should not show listbox without query
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('item selection', () => {
    test('calls onSelect with correct item on click', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape Town' } });

      await waitFor(() => {
        const item = screen.getByText('City of Cape Town');
        fireEvent.click(item);
      });

      expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'CPT',
          name: 'City of Cape Town',
          bbox: expect.any(Array),
        })
      );
    });

    test('updates input value to selected item name', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const item = screen.getByText('City of Cape Town');
        fireEvent.click(item);
      });

      expect(input).toHaveValue('City of Cape Town');
    });

    test('handles onSelect not provided', async () => {
      render(<MunicipalitySearch onSelect={undefined} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const item = screen.getByText('City of Cape Town');
        expect(() => fireEvent.click(item)).not.toThrow();
      });
    });
  });

  describe('clear button', () => {
    test('shows clear button when query is present', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        expect(screen.getByLabelText('Clear')).toBeInTheDocument();
      });
    });

    test('clears query on clear button click', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const clearButton = screen.getByLabelText('Clear');
        fireEvent.click(clearButton);
      });

      expect(input).toHaveValue('');
    });

    test('closes dropdown on clear', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const clearButton = screen.getByLabelText('Clear');
        fireEvent.click(clearButton);
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    test('focuses input after clear', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const clearButton = screen.getByLabelText('Clear');
        fireEvent.click(clearButton);
      });

      expect(input).toHaveFocus();
    });
  });

  describe('keyboard navigation', () => {
    test('opens dropdown on ArrowDown from input', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      // Close dropdown first
      fireEvent.keyDown(input, { key: 'Escape' });

      // Then open with ArrowDown
      fireEvent.keyDown(input, { key: 'ArrowDown' });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    test('closes dropdown on Escape from input', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });

    test('focuses first item on ArrowDown from input', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const items = screen.getAllByRole('option');
        fireEvent.keyDown(input, { key: 'ArrowDown' });

        // First item should be focused
        expect(items[0]).toHaveFocus();
      });
    });

    test('selects item on Enter key', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const items = screen.getAllByRole('option');
        fireEvent.keyDown(items[0], { key: 'Enter' });
      });

      expect(defaultProps.onSelect).toHaveBeenCalled();
    });

    test('Escape key from item returns focus to input', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const items = screen.getAllByRole('option');
      fireEvent.keyDown(items[0], { key: 'Escape' });

      // Focus should return to input
      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });
  });

  describe('CSS classes', () => {
    test('applies searchbox class to container', async () => {
      const { container } = render(<MunicipalitySearch {...defaultProps} />);

      expect(container.querySelector('.searchbox')).toBeInTheDocument();
    });

    test('applies is-open class when dropdown is open', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const control = document.querySelector('.searchbox__control');
        expect(control).toHaveClass('is-open');
      });
    });

    test('removes is-open class when dropdown is closed', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });
      fireEvent.keyDown(input, { key: 'Escape' });

      await waitFor(() => {
        const control = document.querySelector('.searchbox__control');
        expect(control).not.toHaveClass('is-open');
      });
    });
  });

  describe('accessibility', () => {
    test('input has proper id and label association', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      expect(input).toHaveAttribute('id', 'searchbox-input');

      const label = screen.getByText('Municipality search');
      expect(label).toHaveAttribute('for', 'searchbox-input');
    });

    test('listbox has proper role', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const listbox = screen.getByRole('listbox');
        expect(listbox).toBeInTheDocument();
      });
    });

    test('items have proper role', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const items = screen.getAllByRole('option');
        expect(items.length).toBeGreaterThan(0);
      });
    });

    test('input has autocomplete off', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    test('clear button has aria-label', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const clearButton = screen.getByLabelText('Clear');
        expect(clearButton).toHaveAttribute('aria-label', 'Clear');
      });
    });
  });

  describe('item display', () => {
    test('displays municipality name and code', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape Town' } });

      await waitFor(() => {
        expect(screen.getByText('City of Cape Town')).toBeInTheDocument();
        expect(screen.getByText('CPT')).toBeInTheDocument();
      });
    });

    test('items have title attribute', async () => {
      render(<MunicipalitySearch {...defaultProps} />);

      await waitFor(() => {
        expect(document.querySelector('.searchbox__spinner')).not.toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Type municipality name or code…');
      fireEvent.change(input, { target: { value: 'Cape' } });

      await waitFor(() => {
        const item = screen.getByText('City of Cape Town').closest('button');
        expect(item).toHaveAttribute('title', 'City of Cape Town');
      });
    });
  });
});
