# Test Suite Documentation

This directory contains all centralized tests for the SA Risk Frontend application.

## Directory Structure

```
src/__tests__/
├── README.md           # This file
├── lib/                # API layer tests
│   └── api.test.js     # Tests for API client with mocked fetch
└── utils/              # Utility function tests
    ├── bins.test.js    # Tests for logarithmic binning functions
    ├── format.test.js  # Tests for number formatting and HTML escaping
    └── palette.test.js # Tests for color palette constants
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run specific test suites
```bash
# Run only utility tests
npm run test:utils

# Run only API tests
npm run test:api

# Run only component tests
npm run test:components

# Run all tests once
npm run test:all

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Test Coverage

### ✅ Utilities (Complete)

#### 1. bins.test.js (39 tests)
Tests for `makeLogBinsFromRange` and `buildLogEqualBinsIncludingZero`:
- **Valid inputs**: Creating logarithmic bins from various ranges
- **Invalid inputs**: Handling edge cases like zero, negative values, non-finite numbers
- **Edge cases**: Boundary conditions, contiguity, sorting
- **Structure validation**: Ensuring bins have correct properties and relationships

**Key Functions Tested:**
- `makeLogBinsFromRange(gmin, gmax, k)` - Creates K logarithmic bins
- `buildLogEqualBinsIncludingZero(values, k)` - Creates bins including zero bin

#### 2. format.test.js (75 tests)
Tests for `fmtNum` and `esc`:
- **Number formatting**: Different ranges (>=1000, >=100, >=10, <10)
- **Negative numbers**: Proper formatting across all ranges
- **Invalid inputs**: NaN, Infinity, undefined, non-numeric values
- **HTML escaping**: XSS prevention, special character handling
- **Type coercion**: Handling various input types

**Key Functions Tested:**
- `fmtNum(x)` - Formats numbers with appropriate decimal places
- `esc(s)` - Escapes HTML special characters for XSS prevention

#### 3. palette.test.js (25 tests)
Tests for `basePalette`:
- **Structure validation**: Array of 10 hex color codes
- **Color values**: Specific expected colors for risk visualization
- **Uniqueness**: No duplicate colors
- **Hex validation**: Proper hex format (#RRGGBB)
- **Usage compatibility**: Can be reversed, sliced, mapped, filtered
- **Risk levels**: Appropriate colors for low/medium/high risk

**Constants Tested:**
- `basePalette` - 10-color gradient for choropleth maps

## Test Results Summary

```
Test Suites: 10 passed, 10 total
Tests:       409 passed, 409 total
Time:        ~90–120s (CI dependent)
```

### ✅ API Layer (Complete)

#### 4. api.test.js (32 tests)
Tests for API client with fetch mocking:
- **API_BASE configuration**: URL validation and environment variable support
- **getJson/getBlob helpers**: Fetch wrappers with error handling
- **Catalog endpoints**: Periods, themes, indicators, municipalities
- **Choropleth data**: Fetching map data with parameters
- **Search**: Municipality search functionality
- **Export**: Shapefile download as blob
- **Tiles**: Vector tile URL generation
- **Error handling**: Network errors, HTTP errors, JSON parsing

**Key Functions Tested:**
- `getJson(path, params)` - Generic JSON fetch helper
- `getBlob(path, params)` - Generic blob fetch helper
- `api.getPeriods()` - Fetch available time periods
- `api.getThemes({ kind, period })` - Fetch themes by type and period
- `api.getIndicators({ kind, theme, period })` - Fetch indicators
- `api.getMunicipalities()` - Fetch all municipalities
- `api.getChoropleth(indicatorKey, { period, bbox, scenario, extent })` - Fetch choropleth data
- `api.searchMunicipalities(q)` - Search municipalities by name
- `api.downloadShapefile({ indicator, period, scenario })` - Download shapefile
- `api.tileURL(z, x, y)` - Generate tile URL

## Component & Integration Coverage

### ✅ Components (Complete)
- `__tests__/components/Controls.test.jsx` – Control panel behavior and events
- `__tests__/components/Legend.test.jsx` – Legend rendering and toggles
- `__tests__/components/DetailsPanel.test.jsx` – Metadata rendering
- `__tests__/components/MunicipalitySearch.test.jsx` – Search interactions and results
- `__tests__/components/ExportButton.test.jsx` – Export flows and DOM interactions

### ✅ Integration (Complete)
- `__tests__/integration/App.test.jsx` – Full application integration with mocked API and MapLibre.

## Testing Best Practices

1. **Centralized Tests**: All tests are located in `src/__tests__/` for easy maintenance
2. **Descriptive Names**: Test files match the source files they test
3. **Comprehensive Coverage**: Each function tested for valid inputs, invalid inputs, and edge cases
4. **Clear Descriptions**: Each test has a clear, descriptive name
5. **Grouping**: Related tests grouped using `describe` blocks
6. **Isolation**: Tests are independent and can run in any order

## Continuous Integration

To integrate with CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test -- --watchAll=false --coverage
```

## Contributing

When adding new tests:
1. Place them in the appropriate `__tests__/` subdirectory
2. Follow the existing naming convention: `{filename}.test.js`
3. Include comprehensive test cases (valid, invalid, edge cases)
4. Update this README with test counts and descriptions
5. Ensure all tests pass before committing

## Test Statistics

- **Total Test Suites**: 10
- **Total Tests**: 409
- **Pass Rate**: 100%
- **Coverage (from `npm run test:coverage`)**:
  - All files: Statements 70.33%, Branches 73.65%, Functions 77.31%, Lines 71.53%
  - `src/app/App.jsx`: Statements 73.88%, Branches 66.66%, Functions 79.48%, Lines 76.77%
  - Components (DetailsPanel, Legend, Controls, ExportButton, MunicipalitySearch): 91–100% typical
  - Utils and API: ~96–100%

---

Last Updated: 2025-10-10
