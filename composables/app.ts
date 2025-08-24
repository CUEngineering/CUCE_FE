export const getCacheFromState = <Data = unknown>(key: string) => {
  try {
    const data = useState(key).value;
    console.log(`Data from state for key "${key}" ====> `, data);
    return data as Data | undefined;
  } catch (e) {
    console.log(
      `Error getting cached data from state for key "${key}" ====> `,
      e,
    );
  }

  return undefined;
};

export const getCacheKeyFor = (key: string) => {
  const authStore = useAuthStore();
  return `${authStore.role ?? 'UNLOGGED'}-${key}:::token:::${authStore.token}`;
};
