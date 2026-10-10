// Keep stylesheet side-effect imports typed without requiring Vite client types
// in the serverless function compilation environment.
declare module '*.css';
