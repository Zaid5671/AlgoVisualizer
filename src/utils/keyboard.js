// Makes a non-button element behave like a button for keyboard users (Enter or Space activates it).
export const activateOnKey = (fn) => (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
};
