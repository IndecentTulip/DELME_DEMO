declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

export {};