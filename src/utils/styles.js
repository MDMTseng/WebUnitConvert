export const breakpoints = {
  mobile: '767px',  // max-width for mobile
  tablet: '1024px', // max-width for tablet
};

// Helper for media queries using max-width (mobile-first approach)
export const media = {
  mobile: `(max-width: ${breakpoints.mobile})`,
  tablet: `(max-width: ${breakpoints.tablet})`,
  // Add min-width queries if needed, e.g.:
  // desktop: `(min-width: ${parseInt(breakpoints.tablet) + 1}px)`
}; 