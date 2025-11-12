/**
 * Authentication validation utilities
 */

// Configure allowed email domains for your college
export const ALLOWED_EMAIL_DOMAINS = [
  'thapar.edu',
  'society.thapar.edu',
  // Add other thapar-specific subdomains here if needed
];

// Society admin email patterns
export const SOCIETY_EMAIL_PATTERNS = [
  'society.thapar.edu',
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
    // Build a student-facing list that hides society-specific domains
    const visibleDomains = ALLOWED_EMAIL_DOMAINS.filter(d => !d.includes('society.'));
    const domainHint = visibleDomains.length > 0 ? visibleDomains.join(' or ') : 'thapar.edu';
    return { 
      valid: false, 
      error: `Please use your college email address (${domainHint})` 
    };
  }

  const role = getRoleFromEmail(email);
  return { valid: true, role };
}



