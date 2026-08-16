import React from 'react';
import { Redirect } from 'expo-router';
import { useLMS } from '@/context/LMSContext';

export default function IndexRedirect() {
  const { user } = useLMS();
  return <Redirect href={user?.role === 'admin' ? "/admin" as any : user?.role === 'instructor' ? "/instructor" as any : "/dashboard" as any} />;
}
