/**
 * Authentication validation utilities
 */

// Configure allowed email domains for your college
export const ALLOWED_EMAIL_DOMAINS = [
  'campus.edu',
  'student.campus.edu',
  'society.campus.edu',
  'example.com', // For testing/demo purposes
  // Add your actual college domains here
];

// Society admin email patterns
export const SOCIETY_EMAIL_PATTERNS = [
  'society.campus.edu',
  '@society.',
  '.society@',
  'society@example.com', // Test account
];

/**
 * Check if email is from allowed college domain
 */
export function isCollegeEmail(email: string): boolean {
  const emailLower = email.toLowerCase();
  return ALLOWED_EMAIL_DOMAINS.some(domain => 
    emailLower.endsWith(`@${domain}`)
  );
}

/**
 * Check if email is a society admin email
 */
export function isSocietyEmail(email: string): boolean {
  const emailLower = email.toLowerCase();
  return SOCIETY_EMAIL_PATTERNS.some(pattern => 
    emailLower.includes(pattern)
  );
}

/**
 * Get user role based on email
 */
export function getRoleFromEmail(email: string): 'student' | 'society_admin' {
  return isSocietyEmail(email) ? 'society_admin' : 'student';
}

/**
 * Validate email for signup
 */
export function validateCollegeEmail(email: string): { 
  valid: boolean; 
  error?: string;
  role?: 'student' | 'society_admin';
} {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (!isCollegeEmail(email)) {
    return { 
      valid: false, 
      error: `Please use your college email address (${ALLOWED_EMAIL_DOMAINS.join(' or ')})` 
    };
  }

  const role = getRoleFromEmail(email);
  return { valid: true, role };
}



