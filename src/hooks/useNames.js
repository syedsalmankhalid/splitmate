import { findUserByEmail } from '../data/storage'

// Display name for an email: the registered user's name, else the email itself.
export const nameFor = (email) => findUserByEmail(email)?.name || email
export const isRegistered = (email) => !!findUserByEmail(email)
