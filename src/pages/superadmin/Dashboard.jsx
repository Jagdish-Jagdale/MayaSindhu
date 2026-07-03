/**
 * File: Dashboard.jsx
 * Description: Admin dashboard analytics interface displaying total sales, category distribution, and low-stock alerts.
 * Work Done: Optimized product inventory count calculations by deriving stats directly from state to prevent cascading state-render cycles.
 */

// Reusing the exact same Dashboard from the Admin Panel since the Super Admin has equivalent analytical needs.
export { default } from '../admin/Dashboard';
