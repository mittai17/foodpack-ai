/**
 * Auth layout — redirects to (tabs) immediately.
 * Real auth is replaced by mock auth; this group is kept for routing compatibility.
 */
import { Redirect } from 'expo-router';

export default function AuthLayout() {
  return <Redirect href="/(tabs)" />;
}
